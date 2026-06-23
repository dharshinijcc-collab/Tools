import { ExtractedSignals, ScoringFactor, DimensionRuleResult } from '@/types/scoring';

/**
 * RULE ENGINE — Deterministic Scoring
 *
 * Converts extracted signals into scores using explicit rule tables.
 * Every score is fully traceable to specific factors and point values.
 * AI never touches scores — only signals and narration.
 *
 * Score formula per dimension:
 *   raw_points = sum of triggered factors
 *   score = clamp(base + raw_points, 0, 10)
 * where base = 5 (neutral starting point)
 *
 * Max positive contribution can push to 10, negatives down to 0.
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(n: number, min = 0, max = 10): number {
  return Math.min(max, Math.max(min, n));
}

function buildFactor(
  label: string,
  signal_key: string,
  points: number,
  detected: boolean,
): ScoringFactor {
  return { label, signal_key, points, detected };
}

// ── INVESTOR APPEAL ───────────────────────────────────────────────────────────
// Evaluates: market size, revenue model, scalability, exit potential, investor interest

function scoreInvestorAppeal(s: ExtractedSignals): DimensionRuleResult {
  const factors: ScoringFactor[] = [
    buildFactor('Large Addressable Market',       'market_size',              +2,  s.market_size === 'large'),
    buildFactor('Medium Addressable Market',      'market_size_med',          +1,  s.market_size === 'medium'),
    buildFactor('Subscription / Recurring Revenue','revenue_model',            +2,  ['subscription', 'usage_based', 'freemium'].includes(s.revenue_model)),
    buildFactor('One-Time Revenue Model',         'revenue_model_one_time',   -1,  s.revenue_model === 'one_time'),
    buildFactor('High Scalability',               'scalability',              +2,  s.scalability === 'high'),
    buildFactor('Moderate Scalability',           'scalability_mod',          +1,  s.scalability === 'moderate'),
    buildFactor('Strong Exit Potential',          'exit_potential',           +1,  s.exit_potential === 'high'),
    buildFactor('Active Investor Interest in Space','investor_interest_in_space',+1,s.investor_interest_in_space === 'high'),
    buildFactor('High Growth Potential',          'growth_potential',         +1,  s.growth_potential === 'high'),
    buildFactor('Small / Niche Market',           'market_size_small',        -2,  s.market_size === 'small'),
    buildFactor('Low Scalability',                'scalability_low',          -1,  s.scalability === 'low'),

    // --- NEW FACTORS ---
    buildFactor('Funding: Bootstrapped',          'funding_bootstrapped',      0,  s.funding_status === 'bootstrapped'),
    buildFactor('Funding: Raising',               'funding_raising',          +1,  s.funding_status === 'raising'),
    buildFactor('Funding: Raised',                'funding_raised',           +1,  s.funding_status === 'raised'),
    buildFactor('Investor Appeal: Paying Customers','appeal_paying_cust',      +4,  s.validation_level === 'paying_customers'),
    buildFactor('Investor Appeal: Waitlist',      'appeal_waitlist',          +2,  s.validation_level === 'waitlist'),
    buildFactor('Investor Appeal: Conversations', 'appeal_convs',             +1,  s.validation_level === 'conversations'),
    buildFactor('Investor Appeal: No Validation', 'appeal_no_val',            -2,  s.validation_level === 'none'),
    buildFactor('Market Opportunity: Mass Market','mkt_mass_market',          +3,  s.market_size_choice === 'mass_market'),
    buildFactor('Market Opportunity: Large',      'mkt_large',                +2,  s.market_size_choice === 'large'),
    buildFactor('Market Opportunity: Medium',     'mkt_medium',               +1,  s.market_size_choice === 'medium'),
    buildFactor('Market Opportunity: Small',      'mkt_small',                -2,  s.market_size_choice === 'small'),
  ];

  return computeDimensionScore(factors, 'investor_appeal', s);
}

// ── CUSTOMER DEMAND ───────────────────────────────────────────────────────────
// Evaluates: pain severity, frequency, existing buyers, willingness to pay, ROI

function scoreCustomerDemand(s: ExtractedSignals): DimensionRuleResult {
  const factors: ScoringFactor[] = [
    buildFactor('Severe Pain Point',              'pain_severity',          +3,  s.pain_severity === 'severe'),
    buildFactor('Moderate Pain Point',            'pain_severity_mod',      +1,  s.pain_severity === 'moderate'),
    buildFactor('Daily / Frequent Problem',       'problem_frequency',      +2,  ['daily', 'weekly'].includes(s.problem_frequency)),
    buildFactor('Existing Paying Customers',      'existing_buyers',        +2,  s.existing_buyers),
    buildFactor('Clear ROI for Buyer',            'clear_roi',              +2,  s.clear_roi),
    buildFactor('High Willingness to Pay',        'willingness_to_pay',     +1,  s.willingness_to_pay === 'high'),
    buildFactor('Nice-to-Have Product',           'nice_to_have',           -2,  s.nice_to_have),
    buildFactor('Low Willingness to Pay',         'willingness_low',        -2,  s.willingness_to_pay === 'low'),
    buildFactor('Rare / Infrequent Problem',      'problem_frequency_rare', -2,  s.problem_frequency === 'rare'),
    buildFactor('Mild Pain Point',                'pain_mild',              -1,  s.pain_severity === 'mild'),

    // --- NEW FACTORS ---
    buildFactor('No Validation',                  'validation_none',        -2,  s.validation_level === 'none'),
    buildFactor('Validation via Conversations',   'validation_convs',       +1,  s.validation_level === 'conversations'),
    buildFactor('Validation via Waitlist',        'validation_waitlist',    +3,  s.validation_level === 'waitlist'),
    buildFactor('Validation via Paying Customers','validation_paying',      +5,  s.validation_level === 'paying_customers'),
    buildFactor('High Pain Score (8-10)',         'pain_score_high',        +2,  !!s.pain_score && s.pain_score >= 8),
    buildFactor('Medium Pain Score (5-7)',        'pain_score_med',         +1,  !!s.pain_score && s.pain_score >= 5 && s.pain_score <= 7),
    buildFactor('Low Pain Score (1-4)',           'pain_score_low',         -1,  !!s.pain_score && s.pain_score >= 1 && s.pain_score <= 4),
  ];

  return computeDimensionScore(factors, 'customer_demand', s);
}

// ── MARKET TIMING ─────────────────────────────────────────────────────────────
// Evaluates: industry growth, tech maturity, consumer adoption, regulation

function scoreMarketTiming(s: ExtractedSignals): DimensionRuleResult {
  const factors: ScoringFactor[] = [
    buildFactor('Fast-Growing Industry',          'industry_growth',         +3,  s.industry_growth === 'fast'),
    buildFactor('Moderate Industry Growth',       'industry_growth_mod',     +1,  s.industry_growth === 'moderate'),
    buildFactor('Technology Ready to Deploy',     'technology_maturity',     +2,  s.technology_maturity === 'ready'),
    buildFactor('Technology Emerging',            'technology_emerging',     +1,  s.technology_maturity === 'emerging'),
    buildFactor('Consumer Adoption Growing',      'consumer_adoption',       +2,  s.consumer_adoption === 'growing'),
    buildFactor('Regulatory Tailwind',            'regulatory_environment',  +1,  s.regulatory_environment === 'supportive'),
    buildFactor('Market Too Early',               'too_early',               -3,  s.too_early),
    buildFactor('Declining Industry',             'industry_declining',      -3,  s.industry_growth === 'declining'),
    buildFactor('Restrictive Regulation',         'regulation_restrictive',  -2,  s.regulatory_environment === 'restrictive'),
    buildFactor('Technology Not Ready',           'tech_not_ready',          -2,  s.technology_maturity === 'not_ready'),

    // --- NEW FACTORS ---
    buildFactor('Strong "Why Now" Case',          'why_now_strong',          +3,  s.why_now_strength === 'strong'),
    buildFactor('Moderate "Why Now" Case',        'why_now_mod',             +1,  s.why_now_strength === 'moderate'),
    buildFactor('Weak "Why Now" Case',            'why_now_weak',            -2,  s.why_now_strength === 'weak'),
  ];

  return computeDimensionScore(factors, 'market_timing', s);
}

// ── TECHNICAL FEASIBILITY ─────────────────────────────────────────────────────
// Evaluates: build complexity, API availability, MVP feasibility, hardware needs

function scoreTechnicalFeasibility(s: ExtractedSignals): DimensionRuleResult {
  const factors: ScoringFactor[] = [
    buildFactor('Existing APIs Available',        'existing_apis_available', +3,  s.existing_apis_available),
    buildFactor('Simple MVP Possible',            'mvp_complexity',          +2,  s.mvp_complexity === 'simple'),
    buildFactor('Moderate MVP Complexity',        'mvp_complexity_mod',      +1,  s.mvp_complexity === 'moderate'),
    buildFactor('Low Infrastructure Complexity',  'infrastructure_complexity',+1, s.infrastructure_complexity === 'low'),
    buildFactor('Research Required',              'mvp_research',            -3,  s.mvp_complexity === 'research_required'),
    buildFactor('Requires New Hardware',          'requires_new_hardware',   -2,  s.requires_new_hardware),
    buildFactor('Complex MVP',                    'mvp_complex',             -1,  s.mvp_complexity === 'complex'),
    buildFactor('High Infrastructure Complexity', 'infrastructure_high',     -1,  s.infrastructure_complexity === 'high'),

    // --- NEW FACTORS ---
    buildFactor('Forming Stage',                  'stage_forming',            -2,  s.current_stage === 'forming'),
    buildFactor('UX Design Stage',                'stage_ux_design',           0,  s.current_stage === 'ux_design'),
    buildFactor('Prototype Stage',                'stage_prototype',          +2,  s.current_stage === 'prototype'),
    buildFactor('MVP Stage',                      'stage_mvp',                +4,  s.current_stage === 'mvp'),
  ];

  return computeDimensionScore(factors, 'technical_feasibility', s);
}

// ── COMPETITIVE MOAT ──────────────────────────────────────────────────────────
// Evaluates: proprietary data, network effects, switching costs, differentiation

function scoreCompetitiveMoat(s: ExtractedSignals): DimensionRuleResult {
  const factors: ScoringFactor[] = [
    buildFactor('Proprietary Data Advantage',     'has_proprietary_data',  +3,  s.has_proprietary_data),
    buildFactor('Network Effects Present',        'has_network_effects',   +3,  s.has_network_effects),
    buildFactor('High Switching Costs',           'switching_costs',       +2,  s.switching_costs === 'high'),
    buildFactor('Moderate Switching Costs',       'switching_costs_med',   +1,  s.switching_costs === 'medium'),
    buildFactor('Strong Differentiation',         'differentiation',       +2,  s.differentiation === 'strong'),
    buildFactor('Moderate Differentiation',       'differentiation_mod',   +1,  s.differentiation === 'moderate'),
    buildFactor('Easy to Copy',                   'easy_to_copy',          -3,  s.easy_to_copy),
    buildFactor('Very High Competition',          'competition_very_high', -2,  s.competition_level === 'very_high'),
    buildFactor('High Competition',              'competition_high',       -1,  s.competition_level === 'high'),
    buildFactor('Weak Differentiation',           'differentiation_weak',  -2,  s.differentiation === 'weak'),
    buildFactor('Low Switching Costs',            'switching_costs_low',   -1,  s.switching_costs === 'low'),

    // --- NEW FACTORS ---
    buildFactor('Strong Competitive Moat',        'moat_strong',           +3,  s.moat_strength === 'strong'),
    buildFactor('Moderate Competitive Moat',      'moat_moderate',         +1,  s.moat_strength === 'moderate'),
    buildFactor('Weak Competitive Moat',          'moat_weak',             -2,  s.moat_strength === 'weak'),
  ];

  return computeDimensionScore(factors, 'competitive_moat', s);
}

// ── FOUNDER-MARKET FIT ────────────────────────────────────────────────────────
// Evaluates: domain expertise, technical skills, industry experience, credibility

function scoreFounderMarketFit(s: ExtractedSignals): DimensionRuleResult {
  const factors: ScoringFactor[] = [
    buildFactor('Domain Expert Founder',          'domain_expertise',         +3,  s.domain_expertise === 'expert'),
    buildFactor('Experienced in Domain',          'domain_experienced',       +2,  s.domain_expertise === 'experienced'),
    buildFactor('Technical Founder / Background', 'technical_background',     +2,  s.technical_background),
    buildFactor('Deep Industry Experience',       'industry_experience',      +2,  s.industry_experience === 'deep'),
    buildFactor('Some Industry Experience',       'industry_experience_some', +1,  s.industry_experience === 'some'),
    buildFactor('Strong Execution Track Record',  'execution_track_record',   +2,  s.execution_track_record === 'strong'),
    buildFactor('Some Execution Track Record',    'execution_track_some',     +1,  s.execution_track_record === 'some'),
    buildFactor('No Relevant Background',         'no_background',            -2,  s.domain_expertise === 'none'),
    buildFactor('Learning Domain (No Experience)','domain_learning',          -1,  s.domain_expertise === 'learning'),
    buildFactor('No Industry Experience',         'no_industry_exp',          -1,  s.industry_experience === 'none'),
    buildFactor('No Execution Track Record',      'no_execution',             -1,  s.execution_track_record === 'none'),

    // --- NEW FACTORS ---
    buildFactor('Founder Can Code',              'tech_can_code',            +2,  s.technical_background_choice === 'can_code'),
    buildFactor('Founder Used to Code',           'tech_used_to_code',        +1,  s.technical_background_choice === 'used_to_code'),
    buildFactor('No Technical Background',        'tech_no_code',             0,  s.technical_background_choice === 'no'),
    buildFactor('Technical Co-founder Present',   'tech_cofounder_present',   +1,  s.founder_count === 'team' && s.has_technical_cofounder === true),
    buildFactor('Solo Founder',                   'solo_founder_neutral',      0,  s.founder_count === 'solo'),
  ];

  return computeDimensionScore(factors, 'founder_market_fit', s);
}

// ── Core scoring computation ──────────────────────────────────────────────────

function computeDimensionScore(
  factors: ScoringFactor[],
  dimensionKey: string,
  signals: ExtractedSignals,
): DimensionRuleResult {
  const activeFired = factors.filter((f) => f.detected);
  const rawPoints = activeFired.reduce((sum, f) => sum + f.points, 0);

  // Base = 5 (neutral). Points shift up/down from there.
  const rawScore = 5 + rawPoints;
  const score = clamp(rawScore);

  const positiveSignals = activeFired
    .filter((f) => f.points > 0)
    .map((f) => f.label);

  const negativeSignals = activeFired
    .filter((f) => f.points < 0)
    .map((f) => f.label);

  // Confidence = proportion of signals that are NOT "unknown"
  const confidence = computeSignalConfidence(dimensionKey, signals);

  return {
    score,
    confidence,
    factors,
    active_factors: activeFired,
    positive_signals: positiveSignals,
    negative_signals: negativeSignals,
  };
}

/**
 * Confidence is based on how many signals could be determined
 * (not "unknown") for the given dimension.
 */
function computeSignalConfidence(dimensionKey: string, s: ExtractedSignals): number {
  const isKnown = (v: unknown) => v !== 'unknown' && v !== undefined && v !== null;

  const signalGroups: Record<string, () => boolean[]> = {
    investor_appeal: () => [
      isKnown(s.market_size),
      isKnown(s.revenue_model),
      isKnown(s.scalability),
      isKnown(s.exit_potential),
      isKnown(s.growth_potential),
      isKnown(s.investor_interest_in_space),
      isKnown(s.market_size_choice),
      isKnown(s.funding_status),
    ],
    customer_demand: () => [
      isKnown(s.pain_severity),
      isKnown(s.problem_frequency),
      s.existing_buyers !== undefined,
      s.clear_roi !== undefined,
      isKnown(s.willingness_to_pay),
      isKnown(s.validation_level),
      isKnown(s.pain_score),
    ],
    market_timing: () => [
      isKnown(s.industry_growth),
      isKnown(s.technology_maturity),
      isKnown(s.consumer_adoption),
      isKnown(s.regulatory_environment),
      s.too_early !== undefined,
      isKnown(s.why_now_strength),
    ],
    technical_feasibility: () => [
      s.existing_apis_available !== undefined,
      isKnown(s.mvp_complexity),
      s.requires_new_hardware !== undefined,
      isKnown(s.infrastructure_complexity),
      isKnown(s.ai_dependency),
      isKnown(s.current_stage),
    ],
    competitive_moat: () => [
      s.has_proprietary_data !== undefined,
      s.has_network_effects !== undefined,
      isKnown(s.switching_costs),
      isKnown(s.differentiation),
      isKnown(s.competition_level),
      s.easy_to_copy !== undefined,
      isKnown(s.moat_strength),
    ],
    founder_market_fit: () => [
      isKnown(s.domain_expertise),
      s.technical_background !== undefined,
      isKnown(s.industry_experience),
      isKnown(s.execution_track_record),
      isKnown(s.credibility),
      isKnown(s.founder_count),
      isKnown(s.technical_background_choice),
    ],
  };

  const checks = signalGroups[dimensionKey]?.() ?? [];
  if (checks.length === 0) return 50;
  const known = checks.filter(Boolean).length;
  // Base confidence from signals, floored at 40 to avoid wild swings
  return clamp(Math.round((known / checks.length) * 100), 40, 98);
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface RuleEngineOutput {
  investor_appeal:       DimensionRuleResult;
  customer_demand:       DimensionRuleResult;
  market_timing:         DimensionRuleResult;
  technical_feasibility: DimensionRuleResult;
  competitive_moat:      DimensionRuleResult;
  founder_market_fit:    DimensionRuleResult;
}

/**
 * Run the full rule engine against extracted signals.
 * Returns per-dimension scores, confidence, and factor breakdowns.
 * No AI involved — fully deterministic.
 */
export function runRuleEngine(signals: ExtractedSignals): RuleEngineOutput {
  return {
    investor_appeal:       scoreInvestorAppeal(signals),
    customer_demand:       scoreCustomerDemand(signals),
    market_timing:         scoreMarketTiming(signals),
    technical_feasibility: scoreTechnicalFeasibility(signals),
    competitive_moat:      scoreCompetitiveMoat(signals),
    founder_market_fit:    scoreFounderMarketFit(signals),
  };
}

/**
 * Compute overall confidence from Q&A completeness + per-dimension signal confidence.
 * Formula: (qa_completeness * 0.4) + (avg_dimension_confidence * 0.6)
 */
export function computeOverallConfidence(
  ruleOutput: RuleEngineOutput,
  qaAnswered: number,
  qaTotal: number,
): number {
  const qaConfidence = Math.round((qaAnswered / qaTotal) * 100);
  const dims = Object.values(ruleOutput);
  const avgDimConfidence = Math.round(dims.reduce((s, d) => s + d.confidence, 0) / dims.length);
  return clamp(Math.round(qaConfidence * 0.4 + avgDimConfidence * 0.6), 40, 98);
}
