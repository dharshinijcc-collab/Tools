import { BuildTimeInputs, EstimationResult, ModuleEstimate, ScopeDepth } from '@/types/buildtime';
import {
  FEATURE_CATALOG,
  PLATFORM_MULTIPLIERS,
  SPEED_QUALITY_MULTIPLIERS,
  REQUIREMENT_CLARITY_MULTIPLIERS,
  WORKFLOW_NOT_FINALIZED_MULTIPLIER,
  COMPLIANCE_NEED_MULTIPLIER,
  DATA_MIGRATION_MULTIPLIER,
  TEAM_TYPE_MULTIPLIERS
} from './config';
import { v4 as uuidv4 } from 'uuid';

export function calculateEstimate(inputs: BuildTimeInputs): EstimationResult {
  let totalHours = 0;
  const moduleBreakdown: ModuleEstimate[] = [];
  const assumptions: string[] = [];
  const scopeRisks: string[] = [];
  const mvpCuts: string[] = [];
  const phase2Features: string[] = [];

  // 1. Module-by-module calculations
  const selectedModules = FEATURE_CATALOG.filter(m => inputs.selectedFeatures.includes(m.id));
  
  selectedModules.forEach(module => {
    const depth: ScopeDepth = inputs.featureDepths[module.id] || {
      complexity: 'basic',
      customWorkflow: false,
      approvalFlow: false,
      reporting: false,
      edgeCases: false
    };

    // Calculate complexity multiplier for this module
    let compMultiplier = 1.0;
    if (depth.complexity === 'medium') compMultiplier = 1.3;
    if (depth.complexity === 'advanced') compMultiplier = 1.6;

    let adjHours = module.baseHours * compMultiplier;

    // Add extra scope factors
    if (depth.customWorkflow) adjHours += module.baseHours * 0.15;
    if (depth.approvalFlow) adjHours += module.baseHours * 0.15;
    if (depth.reporting) adjHours += module.baseHours * 0.10;
    if (depth.edgeCases) adjHours += module.baseHours * 0.10;

    // Suggest cuts or Phase 2 migration
    if (depth.complexity === 'advanced') {
      mvpCuts.push(`Simplify ${module.name} from 'advanced' to 'basic' to save approx. ${Math.round(module.baseHours * 0.6)} hours.`);
    }
    if (['chat', 'multilingual', 'analytics', 'ocr', 'api_access'].includes(module.id)) {
      phase2Features.push(`${module.name} (${depth.complexity} scope)`);
    }

    const timelineWeeks = Math.ceil(adjHours / 40);
    let complexityLabel: 'Simple' | 'Moderate' | 'Complex' = 'Simple';
    if (depth.complexity === 'advanced' || (depth.customWorkflow && depth.approvalFlow)) {
      complexityLabel = 'Complex';
    } else if (depth.complexity === 'medium' || depth.customWorkflow || depth.edgeCases) {
      complexityLabel = 'Moderate';
    }

    moduleBreakdown.push({
      moduleId: module.id,
      moduleName: module.name,
      category: module.category,
      baseHours: module.baseHours,
      adjustedHours: Math.round(adjHours),
      timelineWeeks,
      complexity: complexityLabel
    });

    totalHours += adjHours;
  });

  // If no features selected, provide a default baseline effort
  if (totalHours === 0) {
    totalHours = 40; 
  }

  // 2. Platform Multiplier
  let platformFactor = 0;
  let platformsCount = 0;
  if (inputs.platforms.web) { platformFactor += PLATFORM_MULTIPLIERS.web; platformsCount++; }
  if (inputs.platforms.ios) { platformFactor += PLATFORM_MULTIPLIERS.ios; platformsCount++; }
  if (inputs.platforms.android) { platformFactor += PLATFORM_MULTIPLIERS.android; platformsCount++; }

  // Discount multi-platform redundant effort if cross-platform logic is used
  if (platformsCount > 1) {
    platformFactor = platformFactor * 0.85; 
    assumptions.push('Assumes a hybrid/cross-platform codebase (like React Native or Flutter) is used to build mobile apps.');
  } else if (platformsCount === 1) {
    platformFactor = Math.max(platformFactor, 1.0);
  } else {
    platformFactor = 1.0; // default web baseline
  }

  // Add extra efforts for secondary assets
  if (inputs.platforms.adminDashboard) { totalHours += 24; }
  if (inputs.platforms.landingPage) { totalHours += 16; }

  totalHours *= platformFactor;

  // 3. Integration additions
  let integrationHours = 0;
  const activeIntegrations = Object.entries(inputs.integrations).filter(([_, v]) => v);
  activeIntegrations.forEach(() => {
    integrationHours += 12; // average 12 hours setup/testing per integration API
  });
  totalHours += integrationHours;

  if (inputs.integrations.paymentGateway) assumptions.push('Assumes Stripe Checkout is used for rapid subscription integration.');
  if (inputs.integrations.aiApis) assumptions.push('Assumes OpenAI/Gemini APIs are used without custom local LLM hosting.');

  // 4. Product Constraint Adjustments (Reductions)
  let constraintMultiplier = 1.0;
  if (inputs.constraints.hasUiDesign) {
    constraintMultiplier -= 0.15; // 15% reduction
    assumptions.push('UI design is finalized; no timeline bloat for visual exploration.');
  } else {
    scopeRisks.push('No UI designs exist. Product design phase will add 2–3 weeks of initial discovery.');
  }

  if (inputs.constraints.hasRequirementsDocs) {
    constraintMultiplier -= 0.10; // 10% reduction
    assumptions.push('Detailed scoping documents exist, reducing back-and-forth specs clarification.');
  }

  totalHours *= Math.max(constraintMultiplier, 0.7); // cap discount at 30%

  // 5. Team type & Speed/Quality trade-off
  const teamMultiplier = TEAM_TYPE_MULTIPLIERS[inputs.teamAssumptions.buildTeamType] || 1.0;
  totalHours *= teamMultiplier;

  const speedQualityMultiplier = SPEED_QUALITY_MULTIPLIERS[inputs.teamAssumptions.speedQualityTradeoff] || 1.0;
  totalHours *= speedQualityMultiplier;

  // 6. Risk Multiplier
  let riskFactor = 1.0;
  const clarityFactor = REQUIREMENT_CLARITY_MULTIPLIERS[inputs.risks.clearRequirements] || 1.0;
  riskFactor *= clarityFactor;

  if (inputs.risks.clearRequirements === 'evolving') {
    scopeRisks.push('Requirements are evolving, which historically results in a 15–20% scope creep.');
  } else if (inputs.risks.clearRequirements === 'vague') {
    scopeRisks.push('Vague requirements significantly increase risk of builders misunderstanding specs.');
  }

  if (!inputs.risks.workflowsFinalized) {
    riskFactor *= WORKFLOW_NOT_FINALIZED_MULTIPLIER;
    scopeRisks.push('User journeys/workflows are not finalized, leading to mid-sprint changes.');
  }
  if (inputs.risks.complianceNeeds) {
    riskFactor *= COMPLIANCE_NEED_MULTIPLIER;
    scopeRisks.push('HIPAA, GDPR, or financial compliance requirements necessitate security audits.');
  }
  if (inputs.risks.dataMigrationNeeded) {
    riskFactor *= DATA_MIGRATION_MULTIPLIER;
    assumptions.push('Data migration from legacy systems is scoped for database engineers.');
  }
  if (inputs.risks.aiAccuracyDependent) {
    scopeRisks.push('AI response accuracy dependencies may cause timeline extension due to prompt tuning.');
  }

  totalHours *= riskFactor;

  // Round values
  totalHours = Math.round(totalHours);
  const totalPersonWeeks = Math.max(1, Math.round(totalHours / 40));

  // 7. Team suggest composition
  const suggestedTeam: string[] = [];
  const teamSize = inputs.teamAssumptions.teamSize || 2;

  if (inputs.teamAssumptions.buildTeamType === 'solo') {
    suggestedTeam.push('1 Full-stack Founder');
  } else {
    if (inputs.platforms.web) suggestedTeam.push('1 Frontend Engineer (Web)');
    if (inputs.platforms.ios || inputs.platforms.android) suggestedTeam.push('1 Mobile App Engineer (Cross-platform)');
    if (selectedModules.some(m => ['crud', 'integrations', 'ocr', 'ai_analysis'].includes(m.id)) || inputs.integrations.customApis) {
      suggestedTeam.push('1 Backend Engineer (Database & APIs)');
    }
    if (!inputs.constraints.hasUiDesign) {
      suggestedTeam.push('1 UI/UX Product Designer (Part-time)');
    }
    if (teamSize >= 3) {
      suggestedTeam.push('1 QA Automation Tester (Part-time)');
    }
    if (teamSize >= 4) {
      suggestedTeam.push('1 Project Manager / Scrum Master (Part-time)');
    }
  }

  // 8. Confidence Score calculation
  let confidenceScore = 90;
  if (inputs.risks.clearRequirements === 'vague') confidenceScore -= 20;
  if (inputs.risks.clearRequirements === 'evolving') confidenceScore -= 10;
  if (!inputs.risks.workflowsFinalized) confidenceScore -= 15;
  if (!inputs.constraints.hasRequirementsDocs) confidenceScore -= 10;
  if (!inputs.constraints.hasUiDesign) confidenceScore -= 10;
  if (inputs.risks.unknownIntegrations) confidenceScore -= 10;
  confidenceScore = Math.max(30, confidenceScore);

  let confidenceLevel: 'Low' | 'Medium' | 'High' = 'High';
  if (confidenceScore < 55) {
    confidenceLevel = 'Low';
  } else if (confidenceScore < 80) {
    confidenceLevel = 'Medium';
  }

  // 9. Scope complexity level based on adjusted hours
  let scopeComplexity: 'Simple' | 'Moderate' | 'Complex' = 'Moderate';
  if (totalHours < 160) {
    scopeComplexity = 'Simple';
  } else if (totalHours > 480) {
    scopeComplexity = 'Complex';
  }

  // Calculate timeline weeks range
  // Dev capacity is assumed to be teamSize * 30 hours of pure dev per week
  const divisor = Math.max(1, teamSize) * 32;
  const baselineWeeks = totalHours / divisor;
  
  const timelineWeeksMin = Math.max(1, Math.round(baselineWeeks * 0.85));
  const timelineWeeksMax = Math.max(2, Math.round(baselineWeeks * 1.25));

  // Add default baseline assumptions
  if (assumptions.length === 0) {
    assumptions.push('Assumes standard agile sprints of 2 weeks.');
  }
  assumptions.push('Assumes developer availability remains constant.');

  return {
    id: uuidv4(),
    projectName: inputs.projectName || 'My Startup Project',
    productType: inputs.productType || 'SaaS Tool',
    createdAt: new Date().toISOString(),
    inputs,
    timelineWeeksMin,
    timelineWeeksMax,
    totalPersonWeeks,
    confidenceLevel,
    confidenceScore,
    scopeComplexity,
    moduleBreakdown,
    suggestedTeam,
    assumptions,
    scopeRisks,
    mvpCuts,
    phase2Features
  };
}
