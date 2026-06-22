import { ScoringResponse, ScoringFactor } from '@/types/scoring';

// ── Shared factor sets (mirror the rule engine tables) ────────────────────────

const investorAppealFactors: ScoringFactor[] = [
  { label: 'Large Addressable Market',        signal_key: 'market_size',              points: +2, detected: true  },
  { label: 'Medium Addressable Market',       signal_key: 'market_size_med',          points: +1, detected: false },
  { label: 'Subscription / Recurring Revenue',signal_key: 'revenue_model',            points: +2, detected: true  },
  { label: 'One-Time Revenue Model',          signal_key: 'revenue_model_one_time',   points: -1, detected: false },
  { label: 'High Scalability',               signal_key: 'scalability',              points: +2, detected: true  },
  { label: 'Moderate Scalability',           signal_key: 'scalability_mod',          points: +1, detected: false },
  { label: 'Strong Exit Potential',          signal_key: 'exit_potential',           points: +1, detected: true  },
  { label: 'Active Investor Interest in Space',signal_key:'investor_interest_in_space',points: +1, detected: false },
  { label: 'High Growth Potential',          signal_key: 'growth_potential',         points: +1, detected: true  },
  { label: 'Small / Niche Market',           signal_key: 'market_size_small',        points: -2, detected: false },
  { label: 'Low Scalability',                signal_key: 'scalability_low',          points: -1, detected: false },
];

const customerDemandFactors: ScoringFactor[] = [
  { label: 'Severe Pain Point',              signal_key: 'pain_severity',            points: +3, detected: true  },
  { label: 'Moderate Pain Point',            signal_key: 'pain_severity_mod',        points: +1, detected: false },
  { label: 'Daily / Frequent Problem',       signal_key: 'problem_frequency',        points: +2, detected: true  },
  { label: 'Existing Paying Customers',      signal_key: 'existing_buyers',          points: +2, detected: false },
  { label: 'Clear ROI for Buyer',            signal_key: 'clear_roi',               points: +2, detected: true  },
  { label: 'High Willingness to Pay',        signal_key: 'willingness_to_pay',       points: +1, detected: false },
  { label: 'Nice-to-Have Product',           signal_key: 'nice_to_have',            points: -2, detected: false },
  { label: 'Low Willingness to Pay',         signal_key: 'willingness_low',         points: -2, detected: false },
  { label: 'Rare / Infrequent Problem',      signal_key: 'problem_frequency_rare',  points: -2, detected: false },
  { label: 'Mild Pain Point',               signal_key: 'pain_mild',               points: -1, detected: false },
];

const marketTimingFactors: ScoringFactor[] = [
  { label: 'Fast-Growing Industry',          signal_key: 'industry_growth',          points: +3, detected: true  },
  { label: 'Moderate Industry Growth',       signal_key: 'industry_growth_mod',      points: +1, detected: false },
  { label: 'Technology Ready to Deploy',     signal_key: 'technology_maturity',      points: +2, detected: true  },
  { label: 'Technology Emerging',            signal_key: 'technology_emerging',      points: +1, detected: false },
  { label: 'Consumer Adoption Growing',      signal_key: 'consumer_adoption',        points: +2, detected: true  },
  { label: 'Regulatory Tailwind',            signal_key: 'regulatory_environment',   points: +1, detected: false },
  { label: 'Market Too Early',               signal_key: 'too_early',               points: -3, detected: false },
  { label: 'Declining Industry',             signal_key: 'industry_declining',       points: -3, detected: false },
  { label: 'Restrictive Regulation',         signal_key: 'regulation_restrictive',   points: -2, detected: false },
  { label: 'Technology Not Ready',           signal_key: 'tech_not_ready',           points: -2, detected: false },
];

const technicalFeasibilityFactors: ScoringFactor[] = [
  { label: 'Existing APIs Available',        signal_key: 'existing_apis_available',  points: +3, detected: true  },
  { label: 'Simple MVP Possible',            signal_key: 'mvp_complexity',           points: +2, detected: false },
  { label: 'Moderate MVP Complexity',        signal_key: 'mvp_complexity_mod',       points: +1, detected: true  },
  { label: 'Low Infrastructure Complexity',  signal_key: 'infrastructure_complexity',points: +1, detected: false },
  { label: 'Research Required',              signal_key: 'mvp_research',             points: -3, detected: false },
  { label: 'Requires New Hardware',          signal_key: 'requires_new_hardware',    points: -2, detected: false },
  { label: 'Complex MVP',                    signal_key: 'mvp_complex',              points: -1, detected: false },
  { label: 'High Infrastructure Complexity', signal_key: 'infrastructure_high',      points: -1, detected: false },
];

const competitiveMoatFactors: ScoringFactor[] = [
  { label: 'Proprietary Data Advantage',     signal_key: 'has_proprietary_data',     points: +3, detected: false },
  { label: 'Network Effects Present',        signal_key: 'has_network_effects',      points: +3, detected: false },
  { label: 'High Switching Costs',           signal_key: 'switching_costs',          points: +2, detected: false },
  { label: 'Moderate Switching Costs',       signal_key: 'switching_costs_med',      points: +1, detected: false },
  { label: 'Strong Differentiation',         signal_key: 'differentiation',          points: +2, detected: false },
  { label: 'Moderate Differentiation',       signal_key: 'differentiation_mod',      points: +1, detected: false },
  { label: 'Easy to Copy',                   signal_key: 'easy_to_copy',             points: -3, detected: false },
  { label: 'Very High Competition',          signal_key: 'competition_very_high',    points: -2, detected: true  },
  { label: 'High Competition',               signal_key: 'competition_high',         points: -1, detected: false },
  { label: 'Weak Differentiation',           signal_key: 'differentiation_weak',     points: -2, detected: true  },
  { label: 'Low Switching Costs',            signal_key: 'switching_costs_low',      points: -1, detected: true  },
];

const founderMarketFitFactors: ScoringFactor[] = [
  { label: 'Domain Expert Founder',          signal_key: 'domain_expertise',         points: +3, detected: false },
  { label: 'Experienced in Domain',          signal_key: 'domain_experienced',       points: +2, detected: false },
  { label: 'Technical Founder / Background', signal_key: 'technical_background',     points: +2, detected: true  },
  { label: 'Deep Industry Experience',       signal_key: 'industry_experience',      points: +2, detected: false },
  { label: 'Some Industry Experience',       signal_key: 'industry_experience_some', points: +1, detected: false },
  { label: 'Strong Execution Track Record',  signal_key: 'execution_track_record',   points: +2, detected: false },
  { label: 'Some Execution Track Record',    signal_key: 'execution_track_some',     points: +1, detected: false },
  { label: 'No Relevant Background',         signal_key: 'no_background',            points: -2, detected: false },
  { label: 'Learning Domain (No Experience)',signal_key: 'domain_learning',          points: -1, detected: false },
  { label: 'No Industry Experience',         signal_key: 'no_industry_exp',          points: -1, detected: true  },
  { label: 'No Execution Track Record',      signal_key: 'no_execution',             points: -1, detected: false },
];

/**
 * Realistic mock AI response used when USE_MOCK_AI=true or GEMINI_API_KEY is missing.
 * Idea: "An AI-powered legal research assistant..."
 */
export const MOCK_SCORING_RESPONSE: ScoringResponse = {
  overall_score: 7,
  startup_quality_score: 7.2,
  investor_readiness_score: 6.8,
  triage_band: 'Promising / Needs Work',
  confidence_level: 78,
  startup_summary: 'This vertical SaaS startup addresses a validated pain point in a large market with proven willingness to pay. While the technical approach is feasible and timing is favorable, the competitive landscape is crowded and founder credibility in this domain is critical for success.',
  why_this_score: 'The startup demonstrates high potential due to strong customer demand and a clear ROI. However, investor readiness is currently constrained by the early stage (forming) and lack of customer validation. Adding a technical co-founder and securing initial letters of intent (LOIs) will significantly improve investor appeal.',
  biggest_assumption: 'Law firms and legal departments will trust AI-generated briefs and legal summaries without requiring manual legal revision.',
  missing_evidence: 'No early waitlist conversions or LOIs showing small law firms are willing to pay $300+/month for this tool.',
  what_increased_the_score: [
    'Large total addressable market in legal tech with proven enterprise spend',
    'Subscription-based recurring SaaS model with high gross margins',
    'Strong market timing as LLM accuracy now clears the bar for legal reasoning tasks',
    'Clear technical feasibility with RAG over legal corpora being well-understood technology',
  ],
  what_reduced_the_score: [
    'Crowded competitive landscape: Harvey AI and Thomson Reuters are targeting this space',
    'High switching costs of existing legal workflows create long enterprise sales cycles',
    'Citation hallucination liability — AI errors in legal briefs expose the company to professional liability risk',
    'Critical need for legal domain credibility: attorneys are trained to distrust non-lawyers',
  ],
  highest_scoring_dimension: 'Market Timing — LLM capabilities have reached the accuracy threshold for legal tasks and courts are actively establishing AI disclosure rules, creating regulatory clarity.',
  lowest_scoring_dimension: 'Competitive Moat — No inherent network effects in the core product and well-funded incumbents are aggressively targeting this segment with existing relationships.',
  how_to_improve: [
    'Recruit a legal tech co-founder with bar credentials to establish vertical trust.',
    'Build and launch a 1-page waitlist to secure 50+ pre-signups from boutique law firms.',
    'Implement a strict verification engine to double-check AI citations against official court databases.',
  ],
  investor_questions: [
    'How do you protect customer data privacy when running LLM inference over sensitive legal filings?',
    'What is your customer acquisition cost (CAC) payback period when selling to small law firms?',
    'Why won\'t incumbents like Westlaw or Clio bundle AI search and make your tool redundant?',
  ],
  dimensions: {
    investor_appeal: {
      score: 7,
      confidence: 75,
      evaluation_criteria: ['Market Size', 'Revenue Model', 'Scalability', 'Funding Interest', 'Exit Potential'],
      why_this_score: 'Legal tech represents a proven venture category with a total addressable market exceeding $20B globally. The B2B SaaS model with recurring monthly subscriptions aligns well with what institutional investors want to see: predictable ARR, high gross margins, and low churn potential in sticky vertical software. Small law firms spend thousands per month on Westlaw and LexisNexis already, confirming willingness to pay at premium price points. However, SMB-focused tools typically trade at lower revenue multiples than enterprise software, because customer acquisition costs are higher and churn risk is elevated when targeting firms without dedicated procurement. The competitive landscape includes well-funded incumbents — Harvey AI raised over $100M targeting large firms, Clio dominates practice management for SMBs — which compresses exit multiples and narrows the strategic acquirer pool. The scalability potential is strong given software economics, but customer acquisition in the legal vertical requires trust-building that slows growth curves compared to horizontal SaaS.',
      positive_signals: ['Large Addressable Market (+2)', 'Subscription / Recurring Revenue (+2)', 'High Scalability (+2)', 'Strong Exit Potential (+1)', 'High Growth Potential (+1)'],
      negative_signals: [],
      improvement_actions: [
        'Position around a defensible niche practice area (e.g. immigration, family law) to own a segment before expanding',
        'Build and publish unit economics data: CAC, LTV, gross margin, churn — investors need these before Series A',
        'Develop a clear enterprise expansion path to increase average contract value and improve exit multiple attractiveness',
        'Pursue strategic partnerships with bar associations for distribution credibility and lower CAC',
      ],
      scoring_factors: investorAppealFactors,
    },
    customer_demand: {
      score: 8,
      confidence: 85,
      evaluation_criteria: ['Pain Severity', 'Problem Frequency', 'Willingness to Pay', 'Market Demand', 'ROI Clarity'],
      why_this_score: 'The pain point is acute and quantifiable. Solo practitioners and small law firms spend 30-40% of their billable hours on legal research — hours that directly represent lost revenue. At $300-500 per billable hour, a tool that cuts research time in half delivers immediate, measurable ROI that can be put in a sales deck slide. Willingness to pay is firmly established through existing premium subscriptions: Westlaw charges $400-600 per user per month, LexisNexis comparable, yet both products are perceived as expensive and not AI-native. The problem frequency is daily for most attorneys, creating consistent usage patterns that drive retention. The underserved segment is real: large firms have Harvey and other enterprise tools, while small firms (under 20 attorneys) are being ignored or offered stripped-down products. The risk is switching cost: attorneys have years of workflow investment in existing tools, and change management in legal practices is notoriously slow.',
      positive_signals: ['Severe Pain Point (+3)', 'Daily / Frequent Problem (+2)', 'Clear ROI for Buyer (+2)'],
      negative_signals: [],
      improvement_actions: [
        'Lead with a free trial targeting the most painful single workflow — case memo generation or deposition prep',
        'Build an ROI calculator quantifying exact hours saved and dollar value per firm size tier',
        'Develop case studies with measurable outcomes: "Firm X reduced research time by 40%, saving $8,400/month"',
        'Focus initial sales on pain-aware prospects: firms already evaluating AI tools, not cold outreach to skeptics',
      ],
      scoring_factors: customerDemandFactors,
    },
    market_timing: {
      score: 8,
      confidence: 80,
      evaluation_criteria: ['Industry Trends', 'Technology Maturity', 'Consumer Readiness', 'Regulatory Clarity', 'Adoption Curve'],
      why_this_score: 'LLM capabilities reached a significant inflection point in 2023-2024. GPT-4 class models passed the bar exam at the 90th percentile, demonstrating that AI can handle complex legal reasoning tasks that were previously impossible to automate. This is not speculation — it is a demonstrated capability threshold. Courts across the US have begun issuing standing orders on AI disclosure, which signals regulatory engagement rather than panic, providing clearer compliance guidelines for legal tech vendors. The legal profession is showing measurable adoption signals: the American Bar Association\'s 2023 Legal Technology Survey showed AI tool adoption doubling year-over-year among attorneys under 40. This represents a classic "right time" scenario — the technology is ready, early adopters are reporting strong efficiency gains, and the regulatory framework is forming rather than blocking. The primary timing risk is that large incumbents will move faster than expected now that the market opportunity is validated.',
      positive_signals: ['Fast-Growing Industry (+3)', 'Technology Ready to Deploy (+2)', 'Consumer Adoption Growing (+2)'],
      negative_signals: [],
      improvement_actions: [
        'Position explicitly as an AI research assistant rather than legal advice, to stay within clear ethical guidelines',
        'Engage proactively with state bar associations on AI guidelines — early involvement shapes favorable rules',
        'Build AI disclosure and citation verification as first-class features, not afterthoughts, for court compliance',
        'Target early adopter firms as reference customers — their public endorsements accelerate adoption in the broader market',
      ],
      scoring_factors: marketTimingFactors,
    },
    technical_feasibility: {
      score: 7,
      confidence: 82,
      evaluation_criteria: ['Build Complexity', 'API Availability', 'Infrastructure Needs', 'MVP Feasibility', 'AI Reliability'],
      why_this_score: 'Retrieval-augmented generation (RAG) over legal corpora is well-understood technology with multiple production implementations demonstrating viability. CourtListener and PACER offer API access to federal case law, enabling data ingestion without complex scraping infrastructure. The core MVP — document upload, AI-assisted research query, citation output — is achievable in 3-4 months with a small technical team of 2-3 engineers. The primary challenge is citation accuracy. Hallucinations in legal citations are not just a product quality problem — they are a liability risk. An attorney who submits a brief citing a case that does not exist faces sanctions. This requires building citation verification as a first-class system, not a post-MVP feature, which adds 2-3 months of development complexity. Infrastructure complexity is moderate: vector databases, embedding pipelines, and LLM APIs are all accessible through managed services, avoiding custom infrastructure builds.',
      positive_signals: ['Existing APIs Available (+3)', 'Moderate MVP Complexity (+1)'],
      negative_signals: [],
      improvement_actions: [
        'Build citation verification and confidence scoring as core features from day one — do not ship without them',
        'Implement human-in-the-loop review workflows for high-stakes documents to reduce liability exposure',
        'Partner with CourtListener or a legal data vendor early for reliable, licensed data access at scale',
        'Scope MVP tightly to one workflow (e.g. case research only) to reach market faster with a defensible quality bar',
      ],
      scoring_factors: technicalFeasibilityFactors,
    },
    competitive_moat: {
      score: 5,
      confidence: 70,
      evaluation_criteria: ['Proprietary Data', 'Network Effects', 'Switching Costs', 'Differentiation', 'Competitive Intensity'],
      why_this_score: 'This is the most challenging dimension. The core product — AI-assisted legal research — has no inherent network effects. Each firm uses the tool independently, so adding more customers does not make the product better for existing customers. Harvey AI raised over $100M and is targeting BigLaw and mid-market firms with significant capital to build distribution. Thomson Reuters acquired Casetext to accelerate their AI capabilities. Clio, dominant in SMB practice management, will likely add AI research functionality. Without proprietary data (a unique legal dataset competitors cannot access), network effects, or deep integrations that create switching costs, the product risks being commoditized as generic AI research becomes a feature rather than a product. The path to a moat requires building data advantages from user interactions, deep integrations with practice management workflows, and brand trust through bar association partnerships — none of which exist at founding stage.',
      positive_signals: [],
      negative_signals: ['Very High Competition (-2)', 'Weak Differentiation (-2)', 'Low Switching Costs (-1)'],
      improvement_actions: [
        'Partner with bar associations to create proprietary datasets from member interactions and precedent databases',
        'Build deep integrations with Clio, MyCase, or PracticePanther to create switching costs through workflow lock-in',
        'Focus on a niche practice area where incumbents are weak — immigration or family law — and dominate before expanding',
        'Develop proprietary training data from anonymized user queries and feedback loops to create data moat over time',
      ],
      scoring_factors: competitiveMoatFactors,
    },
    founder_market_fit: {
      score: 6,
      confidence: 75,
      evaluation_criteria: ['Domain Expertise', 'Technical Background', 'Industry Credibility', 'Execution Capability', 'Network Access'],
      why_this_score: 'Legal workflows are deeply nuanced with specialized terminology, professional ethics requirements, and liability considerations that take years of practice to internalize. Founders without JD credentials face significant trust barriers when selling to attorneys — law firms are trained to be skeptical of non-lawyers giving anything resembling legal guidance. Technical expertise in AI/ML is a genuine advantage and positions the team to build the product faster than law-trained founders could. However, technical expertise alone cannot overcome the domain credibility gap in enterprise sales cycles, where legal operations gatekeepers ask questions about bar compliance, malpractice exposure, and workflow compatibility that require insider knowledge to answer confidently. The team earns credit for technical background but loses points for the absence of domain expertise and industry experience, which will directly impact sales velocity and partnership development.',
      positive_signals: ['Technical Founder / Background (+2)'],
      negative_signals: ['No Industry Experience (-1)'],
      improvement_actions: [
        'Recruit a practicing attorney as co-founder or VP of Legal Strategy — this is the single highest-leverage hire',
        'Build an advisory board with 3-5 respected attorneys from different practice areas for credibility and distribution',
        'Join law school entrepreneurship programs and legal tech incubators (e.g. Stanford CodeX, Harvard Law innovation programs)',
        'Spend 30+ hours in law firm environments before building — shadow attorneys, sit in on research sessions, map their actual workflow',
      ],
      scoring_factors: founderMarketFitFactors,
    },
  },
};

/**
 * Generate a slightly varied mock response for different idea texts.
 * Used to simulate different results per-idea in mock mode.
 */
export function generateMockResponse(ideaText: string): ScoringResponse {
  // Simple deterministic variance based on idea length
  const variance = ideaText.length % 3;
  const scoreShift = variance - 1; // -1, 0, or +1

  const clamp = (n: number) => Math.min(10, Math.max(0, n));

  const base = MOCK_SCORING_RESPONSE;
  const dims = base.dimensions;

  const ia  = clamp(dims.investor_appeal.score + scoreShift);
  const cd  = clamp(dims.customer_demand.score + scoreShift);
  const mt  = clamp(dims.market_timing.score);
  const tf  = clamp(dims.technical_feasibility.score - scoreShift);
  const cm  = clamp(dims.competitive_moat.score + scoreShift);
  const fmf = clamp(dims.founder_market_fit.score);

  const quality = Math.min(10, Math.max(0, Math.round((cd * 0.35 + cm * 0.30 + tf * 0.20 + fmf * 0.15) * 10) / 10));
  const readiness = Math.min(10, Math.max(0, Math.round((ia * 0.40 + mt * 0.30 + fmf * 0.15 + cd * 0.15) * 10) / 10));
  const overall = Math.round((quality + readiness) / 2);

  const triage_band =
    overall >= 8 ? 'Strong Pass' :
    overall >= 5 ? 'Promising / Needs Work' :
    'Not a Fit (Currently)';

  const confidenceLevel = clamp(base.confidence_level + scoreShift * 2);

  return {
    ...base,
    overall_score:            overall,
    startup_quality_score:    quality,
    investor_readiness_score: readiness,
    triage_band,
    confidence_level:         confidenceLevel,
    dimensions: {
      ...dims,
      investor_appeal:       { ...dims.investor_appeal,       score: ia,  confidence: clamp(dims.investor_appeal.confidence + scoreShift * 2) },
      customer_demand:       { ...dims.customer_demand,       score: cd,  confidence: clamp(dims.customer_demand.confidence + scoreShift * 2) },
      market_timing:         { ...dims.market_timing,         score: mt,  confidence: clamp(dims.market_timing.confidence + scoreShift * 2) },
      technical_feasibility: { ...dims.technical_feasibility, score: tf,  confidence: clamp(dims.technical_feasibility.confidence + scoreShift * 2) },
      competitive_moat:      { ...dims.competitive_moat,      score: cm,  confidence: clamp(dims.competitive_moat.confidence + scoreShift * 2) },
      founder_market_fit:    { ...dims.founder_market_fit,    score: fmf, confidence: clamp(dims.founder_market_fit.confidence + scoreShift * 2) },
    },
  };
}
