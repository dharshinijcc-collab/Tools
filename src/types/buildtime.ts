export interface FeatureModule {
  id: string;
  name: string;
  category: string;
  baseHours: number;
  description: string;
}

export interface ScopeDepth {
  complexity: 'basic' | 'medium' | 'advanced';
  customWorkflow: boolean;
  approvalFlow: boolean;
  reporting: boolean;
  edgeCases: boolean;
  followUps?: Record<string, boolean>;
}

export interface BuildTimeInputs {
  // Section A: Project basics
  projectName: string;
  projectDescription: string;
  targetAudience: string;
  problemSolved: string;
  productType: string;

  // Section B: Platforms
  platforms: {
    web: boolean;
    ios: boolean;
    android: boolean;
    adminDashboard: boolean;
    landingPage: boolean;
    multiPlatform: boolean;
  };

  // Section C & D: Core features & Scope Depth
  selectedFeatures: string[]; // ids of selected FeatureModules
  featureDepths: Record<string, ScopeDepth>;

  // Section E: Integrations
  integrations: {
    paymentGateway: boolean;
    emailService: boolean;
    crm: boolean;
    sms: boolean;
    maps: boolean;
    erp: boolean;
    aiApis: boolean;
    cloudStorage: boolean;
    analytics: boolean;
    customApis: boolean;
  };

  // Section F: Product constraints
  constraints: {
    hasUiDesign: boolean;
    hasRequirementsDocs: boolean;
    hasExistingCode: boolean;
    strictLaunchDeadline: boolean;
    targetLaunchDate: string;
    isMvpOnly: boolean;
    mustHaveFeaturesText: string;
  };

  // Section G: Team & Delivery assumptions
  teamAssumptions: {
    buildTeamType: 'solo' | 'freelancer' | 'startup' | 'agency';
    teamSize: number;
    speedQualityTradeoff: 'speed' | 'balanced' | 'quality';
  };

  // Section H: Risk & Uncertainty
  risks: {
    clearRequirements: 'clear' | 'vague' | 'evolving';
    workflowsFinalized: boolean;
    complianceNeeds: boolean;
    aiAccuracyDependent: boolean;
    unknownIntegrations: boolean;
    dataMigrationNeeded: boolean;
  };
}

export interface ModuleEstimate {
  moduleId: string;
  moduleName: string;
  category: string;
  baseHours: number;
  adjustedHours: number;
  timelineWeeks: number;
  complexity: 'Simple' | 'Moderate' | 'Complex';
}

export interface EstimationResult {
  id: string;
  projectName: string;
  productType: string;
  createdAt: string;
  inputs: BuildTimeInputs;
  timelineWeeksMin: number;
  timelineWeeksMax: number;
  totalPersonWeeks: number;
  confidenceLevel: 'Low' | 'Medium' | 'High';
  confidenceScore: number; // percentage
  scopeComplexity: 'Simple' | 'Moderate' | 'Complex';
  moduleBreakdown: ModuleEstimate[];
  suggestedTeam: string[];
  assumptions: string[];
  scopeRisks: string[];
  mvpCuts: string[];
  phase2Features: string[];
}
