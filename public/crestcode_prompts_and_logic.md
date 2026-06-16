# CrestCode Prompts & Logic Blueprint

This document details the exact AI prompt configurations and algorithmic logic used by the **CrestCode Idea Validator** and **Build Time Estimator** tools.

---

## 1. Idea Validator (AI-Powered)

The **Idea Validator** utilizes the `gemini-2.5-flash` model with structured schema validation (JSON output) to score startup ideas across six core dimensions.

### System Prompt
```text
You are CrestCode's startup idea analyst. Given a startup idea description (and optionally additional founder context), analyze it across six dimensions: Investor Appeal, Customer Demand, Market Timing, Technical Feasibility, Competitive Moat, and Founder-Market Fit. For each, return a score (0-10), a one-sentence teaser (max 15 words, reads as a complete thought), a 2-sentence reason, a 1-sentence risk, and a 1-sentence recommendation. Calculate overall_score using the weighted formula provided and assign a triage_band. Return strict JSON matching the provided schema only — no markdown, no commentary.

Weighted formula:
overall_score = round(investor_appeal * 0.20 + customer_demand * 0.20 + market_timing * 0.15 + technical_feasibility * 0.15 + competitive_moat * 0.15 + founder_market_fit * 0.15)

triage_band values:
- "Strong Pass" if overall_score >= 8
- "Promising / Needs Work" if overall_score 5-7
- "Not a Fit (Currently)" if overall_score <= 4

Scoring guidance:
- Use the founder context (target audience, revenue model, competitive landscape, founder background, current stage) to produce highly specific, actionable analysis rather than generic observations.
- If founder context is not provided for a dimension, infer from the idea description and note assumptions.
- Be honest and direct — founders need real signal, not inflated scores.
```

### JSON Response Schema
```json
{
  "type": "OBJECT",
  "properties": {
    "overall_score": { "type": "NUMBER" },
    "triage_band": {
      "type": "STRING",
      "enum": ["Strong Pass", "Promising / Needs Work", "Not a Fit (Currently)"]
    },
    "dimensions": {
      "type": "OBJECT",
      "properties": {
        "investor_appeal": {
          "type": "OBJECT",
          "properties": {
            "score": { "type": "NUMBER" },
            "teaser": { "type": "STRING" },
            "reason": { "type": "STRING" },
            "risk": { "type": "STRING" },
            "recommendation": { "type": "STRING" }
          },
          "required": ["score", "teaser", "reason", "risk", "recommendation"]
        },
        "customer_demand": { ... },
        "market_timing": { ... },
        "technical_feasibility": { ... },
        "competitive_moat": { ... },
        "founder_market_fit": { ... }
      },
      "required": [
        "investor_appeal",
        "customer_demand",
        "market_timing",
        "technical_feasibility",
        "competitive_moat",
        "founder_market_fit"
      ]
    }
  },
  "required": ["overall_score", "triage_band", "dimensions"]
}
```

---

## 2. Build Time Estimator (Deterministic Scoring Logic)

The Build Time Estimator uses a step-by-step rule-based formula to compute minimum and maximum timeline ranges (in weeks). 

### How the Time Estimator Calculates: Step-by-Step

The tool gathers user inputs through a 5-step wizard and executes the following algorithm:

#### Step 2.1: Establish the Project Type Baseline
The engine sets the initial timeline range `[Min Weeks, Max Weeks]` based on the selected project type:
* **Website**: 2 to 4 weeks
* **Web App**: 6 to 10 weeks
* **Admin Panel**: 4 to 7 weeks
* **Mobile App**: 8 to 13 weeks
* **AI Tool**: 6 to 11 weeks
* **SaaS Platform**: 8 to 14 weeks

#### Step 2.2: Apply Multi-Platform Overhead
If the project needs to run on multiple platforms (Web, iOS, Android, Desktop), a parallel pipeline multiplier is added:
$$\text{Extra Platform Overhead} = (\text{Active Platforms} - 1) \times 35\%$$
$$\text{Timeline} = \text{Timeline} \times (1 + \text{Extra Platform Overhead})$$

#### Step 2.3: Calculate Integrations & Features Buffer
Feature selections add fixed blocks of development time directly to the ranges:
* **Login / Auth**: +1 to +2 weeks
* **Admin Panel**: +1.5 to +3 weeks
* **Payment Integration**: +1.5 to +2.5 weeks
* **Third-Party APIs**: +1 to +2 weeks
* **AI / OCR Features**: +2 to +4 weeks
* **File Upload / Storage**: +0.5 to +1.5 weeks

#### Step 2.4: Factor in Special Technical Requirements
Advanced criteria add further security and compliance buffers:
* **High Security / Audit Hardening**: +1.5 to +3 weeks
* **CDN & Performance Optimization**: +0.5 to +1.5 weeks
* **GDPR / HIPAA / SOC2 Compliance**: +2 to +3.5 weeks
* **Reports, Charts & PDF Exports**: +1 to +2 weeks

#### Step 2.5: Apply Design Readiness Adjustment
Finalized mockups accelerate layout delivery, while missing designs add discovery phases:
* **Finalized Figma mockups**: +0 weeks
* **Draft wireframes / specs**: +1 to +2 weeks
* **Starting from scratch**: +2 to +4 weeks

#### Step 2.6: Apply Active Blocker Buffer
Each dependency blocker (waiting on API keys, regulatory approvals, migration specs) adds project risk padding:
* **Each Active Blocker**: +0.7 weeks (min) to +1.5 weeks (max)

#### Step 2.7: Apply Team Velocity Modifier
Finally, the speed and efficiency of the build team are factored in as a percentage multiplier:
* **Solo Developer**: +25% to +35% total weeks (sequential delivery overhead)
* **Freelancers**: +10% to +20% total weeks (coordination overhead)
* **Internal Team**: +0% (baseline velocity)
* **Agency / Studio**: -5% to -10% total weeks (structured parallel workstreams)

#### Step 2.8: Final Output & Feasibility Check
- The final numbers are rounded to the nearest week.
- If a target launch date is specified, the engine calculates the difference in weeks between today and the target date:
  - If target date is **less than Min Weeks**: Feasibility is **Unrealistic**.
  - If target date is **between Min and Max Weeks**: Feasibility is **Tight**.
  - If target date is **more than Max Weeks**: Feasibility is **Realistic**.
