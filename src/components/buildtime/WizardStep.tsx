'use client';

import { useState } from 'react';
import { BuildTimeInputs, ScopeDepth } from '@/types/buildtime';
import { FEATURE_CATALOG } from '@/lib/buildtime/config';

interface WizardStepProps {
  inputs: BuildTimeInputs;
  onChange: (inputs: BuildTimeInputs) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function WizardStep({ inputs, onChange, onSubmit, onCancel }: WizardStepProps) {
  const [step, setStep] = useState(0);

  const stepsList = [
    'Basics',
    'Platforms',
    'Features',
    'Feature Depth',
    'Integrations',
    'Constraints',
    'Team Setup',
    'Roadmap Risks',
  ];

  const handleNext = () => {
    if (step === 2 && inputs.selectedFeatures.length === 0) {
      alert('Please select at least 1 feature module to continue.');
      return;
    }
    if (step === stepsList.length - 1) {
      onSubmit();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 0) {
      onCancel();
    } else {
      setStep(step - 1);
    }
  };

  const updatePlatforms = (field: keyof BuildTimeInputs['platforms'], value: boolean) => {
    onChange({
      ...inputs,
      platforms: {
        ...inputs.platforms,
        [field]: value
      }
    });
  };

  const toggleFeature = (id: string) => {
    const selected = [...inputs.selectedFeatures];
    const index = selected.indexOf(id);
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(id);
    }
    onChange({
      ...inputs,
      selectedFeatures: selected
    });
  };

  const updateFeatureDepth = (id: string, key: keyof ScopeDepth, value: any) => {
    const defaults: ScopeDepth = {
      complexity: 'basic',
      customWorkflow: false,
      approvalFlow: false,
      reporting: false,
      edgeCases: false
    };
    const current = inputs.featureDepths[id] || defaults;
    onChange({
      ...inputs,
      featureDepths: {
        ...inputs.featureDepths,
        [id]: {
          ...current,
          [key]: value
        }
      }
    });
  };

  const updateIntegrations = (field: keyof BuildTimeInputs['integrations'], value: boolean) => {
    onChange({
      ...inputs,
      integrations: {
        ...inputs.integrations,
        [field]: value
      }
    });
  };

  const updateConstraints = (field: keyof BuildTimeInputs['constraints'], value: any) => {
    onChange({
      ...inputs,
      constraints: {
        ...inputs.constraints,
        [field]: value
      }
    });
  };

  const updateTeam = (field: keyof BuildTimeInputs['teamAssumptions'], value: any) => {
    onChange({
      ...inputs,
      teamAssumptions: {
        ...inputs.teamAssumptions,
        [field]: value
      }
    });
  };

  const updateRisks = (field: keyof BuildTimeInputs['risks'], value: any) => {
    onChange({
      ...inputs,
      risks: {
        ...inputs.risks,
        [field]: value
      }
    });
  };

  const progressPercent = ((step + 1) / stepsList.length) * 100;

  // Validation checks for Next button
  const isBasicsValid = inputs.projectName.trim().length > 0 && inputs.projectDescription.trim().length >= 10;
  const isPlatformsValid = inputs.platforms.web || inputs.platforms.ios || inputs.platforms.android;

  const isNextDisabled = 
    (step === 0 && !isBasicsValid) ||
    (step === 1 && !isPlatformsValid);

  return (
    <div className="card" style={{ padding: '28px 32px', background: 'linear-gradient(135deg, #fff 0%, #F8FAFF 100%)', border: '1.5px solid var(--border)' }}>
      
      {/* Wizard Progress Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
            Step {step + 1} of {stepsList.length} &middot; {stepsList[step]}
          </span>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)' }}>
            {Math.round(progressPercent)}% complete
          </span>
        </div>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, var(--primary) 0%, #5B8FBF 100%)',
            borderRadius: 999,
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Steps Content switcher */}
      <div style={{ minHeight: 300, animation: 'fadeIn 0.25s ease' }}>
        
        {/* STEP 0: Project Basics */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              🚀 Project Basics
            </h3>
            
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Project Name
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. BuildTime AI, Uber for Pets, CrestCode"
                value={inputs.projectName}
                onChange={(e) => onChange({ ...inputs, projectName: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                What are you building? (Describe the core concept)
              </label>
              <textarea
                className="input"
                rows={4}
                placeholder="e.g. A marketplace platform linking legal agencies with corporate clients, offering real-time task workflows and Stripe payouts..."
                value={inputs.projectDescription}
                onChange={(e) => onChange({ ...inputs, projectDescription: e.target.value })}
                style={{ resize: 'vertical' }}
                required
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Min 10 characters required.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="responsive-grid">
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Who is the Target Customer?
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Agency owners, developers"
                  value={inputs.targetAudience}
                  onChange={(e) => onChange({ ...inputs, targetAudience: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Product Category Type
                </label>
                <select
                  className="input"
                  value={inputs.productType}
                  onChange={(e) => onChange({ ...inputs, productType: e.target.value })}
                  style={{ height: 47 }}
                >
                  <option value="SaaS product">SaaS Platform</option>
                  <option value="Web App">Web Application</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="Marketplace">Marketplace</option>
                  <option value="AI tool">AI Agent / Integrator</option>
                  <option value="Admin Panel">Admin Dashboard</option>
                  <option value="Internal Tool">Internal Enterprise Utility</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Platforms */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              📱 Platforms & Interfaces
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Which interfaces are required for the initial release? (Select all that apply)
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { field: 'web', label: 'Web Application (Frontend)', desc: 'Optimized for browsers.' },
                { field: 'ios', label: 'iOS Mobile App (Native/Hybrid)', desc: 'For Apple devices.' },
                { field: 'android', label: 'Android Mobile App', desc: 'For Google devices.' },
                { field: 'adminDashboard', label: 'Admin Panel / Dashboard', desc: 'For internal user management.' },
                { field: 'landingPage', label: 'Public Marketing Landing Page', desc: 'Marketing content page.' },
              ].map((plat) => (
                <label
                  key={plat.field}
                  className="card"
                  style={{
                    padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer',
                    background: inputs.platforms[plat.field as keyof BuildTimeInputs['platforms']] ? 'rgba(46,92,138,0.06)' : '#fff',
                    borderColor: inputs.platforms[plat.field as keyof BuildTimeInputs['platforms']] ? 'var(--primary)' : 'var(--border)'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!inputs.platforms[plat.field as keyof BuildTimeInputs['platforms']]}
                    onChange={(e) => updatePlatforms(plat.field as keyof BuildTimeInputs['platforms'], e.target.checked)}
                    style={{ marginTop: 4 }}
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{plat.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{plat.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Core Feature Selections */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              🛠️ Feature Catalog Scoping
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Select modules matching your application requirements.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              {FEATURE_CATALOG.map((feat) => {
                const active = inputs.selectedFeatures.includes(feat.id);
                return (
                  <div
                    key={feat.id}
                    className="card"
                    onClick={() => toggleFeature(feat.id)}
                    style={{
                      padding: 14, cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start',
                      background: active ? 'rgba(46,92,138,0.06)' : '#fff',
                      borderColor: active ? 'var(--primary)' : 'var(--border)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, border: '1.5px solid var(--border-strong)',
                      borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: active ? 'var(--primary)' : '#fff',
                      color: '#fff', fontSize: 11, fontWeight: 900
                    }}>
                      {active ? '✓' : ''}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{feat.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.3 }}>{feat.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Feature Depth Configuration */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
              🎛️ Detailed Scope Depth
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Configure scope scale, workflow complexities, and custom requirements for selected features.
            </p>

            {inputs.selectedFeatures.length === 0 ? (
              <p style={{ color: 'var(--score-amber)' }}>No features selected. Go back to step 3 to choose features.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxHeight: 400, overflowY: 'auto', paddingRight: 10 }}>
                {FEATURE_CATALOG.filter(m => inputs.selectedFeatures.includes(m.id)).map((feat) => {
                  const depth = inputs.featureDepths[feat.id] || {
                    complexity: 'basic',
                    customWorkflow: false,
                    approvalFlow: false,
                    reporting: false,
                    edgeCases: false
                  };

                  return (
                    <div key={feat.id} className="card" style={{ padding: 16, background: '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
                          🔧 {feat.name}
                        </h4>
                        
                        {/* Complexity select */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Scale Size:</span>
                          <select
                            value={depth.complexity}
                            onChange={(e) => updateFeatureDepth(feat.id, 'complexity', e.target.value)}
                            style={{ padding: '3px 8px', fontSize: 12, border: '1px solid var(--border)', borderRadius: 4 }}
                          >
                            <option value="basic">Basic (Simple UI)</option>
                            <option value="medium">Medium (Standard Core)</option>
                            <option value="advanced">Advanced (Highly Customized)</option>
                          </select>
                        </div>
                      </div>

                      {/* Extra scope switches */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {[
                          { key: 'customWorkflow', label: 'Custom Workflow logic (+15%)' },
                          { key: 'approvalFlow', label: 'Approval/Moderation workflows (+15%)' },
                          { key: 'reporting', label: 'Embedded reporting/analytics (+10%)' },
                          { key: 'edgeCases', label: 'High Edge Case complexity (+10%)' },
                        ].map((sw) => (
                          <label key={sw.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <input
                              type="checkbox"
                              checked={!!depth[sw.key as keyof ScopeDepth]}
                              onChange={(e) => updateFeatureDepth(feat.id, sw.key as keyof ScopeDepth, e.target.checked)}
                            />
                            {sw.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Integrations */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              🔗 Integrations & API Connections
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Which external services must the tool communicate with?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              {[
                { field: 'paymentGateway', label: 'Stripe/Billing API', desc: 'Subscriptions or invoices.' },
                { field: 'emailService', label: 'SendGrid / Email alerts', desc: 'Transactional workflows.' },
                { field: 'crm', label: 'Hubspot / Salesforce Sync', desc: 'Leads routing.' },
                { field: 'sms', label: 'Twilio / SMS notifications', desc: 'Alerts or 2FA.' },
                { field: 'maps', label: 'Google Maps / Location APIs', desc: 'Addresses & mapping.' },
                { field: 'aiApis', label: 'OpenAI / Gemini integrations', desc: 'Generative actions.' },
                { field: 'cloudStorage', label: 'AWS S3 / File Hosting', desc: 'Database uploads.' },
                { field: 'analytics', label: 'Mixpanel / Segment SDKs', desc: 'User event tracking.' },
                { field: 'customApis', label: 'Custom Third-party API hooks', desc: 'Specialized systems.' },
              ].map((integ) => (
                <label
                  key={integ.field}
                  className="card"
                  style={{
                    padding: 14, display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer',
                    background: inputs.integrations[integ.field as keyof BuildTimeInputs['integrations']] ? 'rgba(46,92,138,0.06)' : '#fff',
                    borderColor: inputs.integrations[integ.field as keyof BuildTimeInputs['integrations']] ? 'var(--primary)' : 'var(--border)'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!inputs.integrations[integ.field as keyof BuildTimeInputs['integrations']]}
                    onChange={(e) => updateIntegrations(integ.field as keyof BuildTimeInputs['integrations'], e.target.checked)}
                    style={{ marginTop: 3 }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{integ.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{integ.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Product Constraints */}
        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              ⚙️ Scope Constraints & Assets
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="responsive-grid">
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { field: 'hasUiDesign', label: 'We already have completed UI Designs (Figma/Adobe XD)' },
                  { field: 'hasRequirementsDocs', label: 'We have detailed PRDs/spec docs ready' },
                  { field: 'hasExistingCode', label: 'We are expanding an existing code repository' },
                  { field: 'strictLaunchDeadline', label: 'We have a strict drop-dead launch deadline' },
                  { field: 'isMvpOnly', label: 'This project is MVP only (No long term scaling specs)' },
                ].map((con) => (
                  <label key={con.field} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!inputs.constraints[con.field as keyof BuildTimeInputs['constraints']]}
                      onChange={(e) => updateConstraints(con.field as keyof BuildTimeInputs['constraints'], e.target.checked)}
                    />
                    {con.label}
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Target Launch Date (Optional)
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={inputs.constraints.targetLaunchDate}
                    onChange={(e) => updateConstraints('targetLaunchDate', e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                    Additional constraints notes (Must-have features vs Phase 2)
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="e.g. Subscriptions are nice to have, main focus is OCR parsing logic."
                    value={inputs.constraints.mustHaveFeaturesText}
                    onChange={(e) => updateConstraints('mustHaveFeaturesText', e.target.value)}
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 6: Team assumptions */}
        {step === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              👥 Team & Development Assumptions
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Who is building the project?
                </label>
                <select
                  className="input"
                  value={inputs.teamAssumptions.buildTeamType}
                  onChange={(e) => updateTeam('buildTeamType', e.target.value)}
                  style={{ height: 47 }}
                >
                  <option value="solo">Solo Founder (Calculates extra context switching)</option>
                  <option value="freelancer">Freelancer contract build</option>
                  <option value="startup">Startup Core Internal Team (Agile)</option>
                  <option value="agency">External Software Agency build</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Total builders working on code (Engineers)
                </label>
                <input
                  type="number"
                  className="input"
                  min={1}
                  max={10}
                  value={inputs.teamAssumptions.teamSize}
                  onChange={(e) => updateTeam('teamSize', parseInt(e.target.value) || 1)}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Preferred velocity prioritization
                </label>
                <select
                  className="input"
                  value={inputs.teamAssumptions.speedQualityTradeoff}
                  onChange={(e) => updateTeam('speedQualityTradeoff', e.target.value)}
                  style={{ height: 47 }}
                >
                  <option value="speed">Speed first (Rapid prototyping, lower testing audits)</option>
                  <option value="balanced">Balanced build quality & speed</option>
                  <option value="quality">Quality prioritized (Heavy testing, code audits, full QA)</option>
                </select>
              </div>

            </div>
          </div>
        )}

        {/* STEP 7: Risk & Uncertainty factors */}
        {step === 7 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              ⚡ Roadmaps & Risks
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="responsive-grid">
              
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  How clear are the specifications?
                </label>
                <select
                  className="input"
                  value={inputs.risks.clearRequirements}
                  onChange={(e) => updateRisks('clearRequirements', e.target.value)}
                  style={{ height: 47, marginBottom: 16 }}
                >
                  <option value="clear">Perfect clarity (Wireframes, databases, and APIs defined)</option>
                  <option value="evolving">Evolving (Features are clear, database schema details still raw)</option>
                  <option value="vague">Vague specs (Feature checklists only)</option>
                </select>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: 12 }}>
                  <input
                    type="checkbox"
                    checked={inputs.risks.workflowsFinalized}
                    onChange={(e) => updateRisks('workflowsFinalized', e.target.checked)}
                  />
                  User journeys & workflows are 100% finalized
                </label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { field: 'complianceNeeds', label: 'Compliance/Regulatory requirements exist (HIPAA/GDPR)' },
                  { field: 'aiAccuracyDependent', label: 'Output depends heavily on high accuracy LLM parsing' },
                  { field: 'unknownIntegrations', label: 'Contains unknown/untested external APIs' },
                  { field: 'dataMigrationNeeded', label: 'Legacy data migration is necessary' },
                ].map((riskField) => (
                  <label key={riskField.field} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!inputs.risks[riskField.field as keyof BuildTimeInputs['risks']]}
                      onChange={(e) => updateRisks(riskField.field as keyof BuildTimeInputs['risks'], e.target.checked)}
                    />
                    {riskField.label}
                  </label>
                ))}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Navigation button row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
        <button className="btn btn-secondary" onClick={handleBack}>
          &larr; Back
        </button>

        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={isNextDisabled}
          style={{ minWidth: 140 }}
        >
          {step === stepsList.length - 1 ? '⚡ Calculate Scoping' : 'Next →'}
        </button>
      </div>

    </div>
  );
}
