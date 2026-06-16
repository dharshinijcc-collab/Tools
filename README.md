# CrestCode Idea Validator — Developer Reference Guide

This guide details the core logic, configurations, AI prompts, scoring formulas, and file/line locations for variables used throughout this project.

---

## 1. Mock Flags: `USE_MOCK_AI` & `USE_MOCK_DB`

These flags determine whether the application runs using simulated local offline mode or connects to real live services.

### Where they are configured:
*   **[.env.local](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/.env.local)**
    *   `USE_MOCK_AI=true` (Line 8): When set to `true`, the API returns varied static startup evaluations deterministic of the input length, avoiding OpenAI API calls and billing.
    *   `USE_MOCK_DB=true` (Line 9): When set to `true`, all registrations, sessions, and saved evaluations are handled in-memory and synced to client-side `localStorage`, bypassing Supabase.

### Where they are evaluated in code:
*   **[route.ts](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/app/api/score/route.ts)**
    *   Line 12: Resolves `USE_MOCK_AI` using environment values or falls back to `true` if `OPENAI_API_KEY` is missing or placeholder.
    *   Line 13: Resolves `USE_MOCK_DB` using environment values or falls back to `true` if `NEXT_PUBLIC_SUPABASE_URL` is missing or placeholder.
    *   Line 77: Bypasses OpenAI and calls `generateMockResponse(idea_text)` if `USE_MOCK_AI` is true.
    *   Line 118: Saves result to in-memory store `mockDb` if `USE_MOCK_DB` is true.
*   **[useAuth.ts](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/hooks/useAuth.ts)**
    *   Line 8: Evaluates `USE_MOCK_DB`.
    *   Lines 15–38: Handles local sync of state using `localStorage` key `crestcode_mock_user` if `USE_MOCK_DB` is true.

---

## 2. API Keys & Database URL Locations

If you set `USE_MOCK_DB=false` and `USE_MOCK_AI=false`, you must provide actual keys in [.env.local](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/.env.local). Here is where they are read:

### 1. OpenAI API Key
*   **[.env.local](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/.env.local)** (Line 7): `OPENAI_API_KEY=placeholder-openai-key`
*   **[openai.ts](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/lib/openai.ts)** (Line 8): Read by client constructor `apiKey: process.env.OPENAI_API_KEY`.

### 2. Supabase Anon Public Key
*   **[.env.local](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/.env.local)** (Line 5): `NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key`
*   **[client.ts](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/lib/supabase/client.ts)** (Line 4): Reads anon key `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!`.
*   **[server.ts](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/lib/supabase/server.ts)** (Line 9): Reads anon key `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!`.

### 3. Supabase Database URL
*   **[.env.local](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/.env.local)** (Line 4): `NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co`
*   **[client.ts](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/lib/supabase/client.ts)** (Line 3): Reads url `process.env.NEXT_PUBLIC_SUPABASE_URL!`.
*   **[server.ts](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/lib/supabase/server.ts)** (Line 8): Reads url `process.env.NEXT_PUBLIC_SUPABASE_URL!`.
*   **[admin.ts](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/lib/supabase/admin.ts)** (Line 9): Reads url `process.env.NEXT_PUBLIC_SUPABASE_URL!`.

### 4. Supabase Service Role Key (Admin Access)
*   **[.env.local](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/.env.local)** (Line 6): `SUPABASE_SERVICE_ROLE_KEY=placeholder-service-role-key`
*   **[admin.ts](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/lib/supabase/admin.ts)** (Line 10): Reads admin key `process.env.SUPABASE_SERVICE_ROLE_KEY!`.

---

## 3. Scoring Formula & Logic

The scoring system calculates an overall score as a weighted average of 6 dimension scores.

### Formula Definition:
```text
overall_score = Math.round(
  investor_appeal       * 0.20 +
  customer_demand       * 0.20 +
  market_timing         * 0.15 +
  technical_feasibility * 0.15 +
  competitive_moat      * 0.15 +
  founder_market_fit    * 0.15
)
```

### Where it is located in code:
*   **[score-calculator.ts](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/lib/score-calculator.ts)**
    *   Lines 14–21: `computeOverallScore()` calculates the overall score based on the dimensions dictionary using weights:
        *   `investor_appeal` weight: `0.20` (Line 15)
        *   `customer_demand` weight: `0.20` (Line 16)
        *   `market_timing` weight: `0.15` (Line 17)
        *   `technical_feasibility` weight: `0.15` (Line 18)
        *   `competitive_moat` weight: `0.15` (Line 19)
        *   `founder_market_fit` weight: `0.15` (Line 20)
*   **[scoring.ts](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/types/scoring.ts)**
    *   Lines 34–41: `DIMENSION_META` holds metadata mappings for weights and icons.
*   **[route.ts](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/app/api/score/route.ts)**
    *   Line 109: API route invokes `computeOverallScore` to overwrite/verify output consistency.

---

## 4. Triage Band Criteria

Evaluates which investment readiness tier the overall score fits into.

### Criteria Definition:
*   `Strong Pass`: Overall score $\ge$ 8
*   `Promising / Needs Work`: Overall score 5 to 7
*   `Not a Fit (Currently)`: Overall score $\le$ 4

### Where it is located in code:
*   **[score-calculator.ts](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/lib/score-calculator.ts)**
    *   Line 27: `computeTriageBand(score)` returns the band string.
*   **[scoring.ts](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/types/scoring.ts)**
    *   Lines 49–68: `TRIAGE_CONFIG` stores color hexes and backgrounds for UI rendering.

---

## 5. OpenAI System Instruction & JSON Schema

When `USE_MOCK_AI=false`, the API route requests structured JSON output from OpenAI.

### System Instructions / Prompt:
*   **[openai.ts](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/lib/openai.ts)** (Lines 14–22):
    ```text
    You are CrestCode's startup idea analyst. Given a startup idea description, analyze it across six dimensions: Investor Appeal, Customer Demand, Market Timing, Technical Feasibility, Competitive Moat, and Founder-Market Fit. For each, return a score (0-10), a one-sentence teaser (max 15 words, reads as a complete thought), a 2-sentence reason, a 1-sentence risk, and a 1-sentence recommendation. Calculate overall_score using the weighted formula provided and assign a triage_band. Return strict JSON matching the provided schema only — no markdown, no commentary.

    Weighted formula:
    overall_score = round(investor_appeal * 0.20 + customer_demand * 0.20 + market_timing * 0.15 + technical_feasibility * 0.15 + competitive_moat * 0.15 + founder_market_fit * 0.15)

    triage_band values:
    - "Strong Pass" if overall_score >= 8
    - "Promising / Needs Work" if overall_score 5-7
    - "Not a Fit (Currently)" if overall_score <= 4
    ```

### Structured Output Schema (`RESPONSE_SCHEMA`):
*   **[openai.ts](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/lib/openai.ts)** (Lines 24–111):
    Enforces structured output matching:
    ```typescript
    {
      overall_score: number,
      triage_band: "Strong Pass" | "Promising / Needs Work" | "Not a Fit (Currently)",
      dimensions: {
        investor_appeal: { score, teaser, reason, risk, recommendation },
        customer_demand: { score, teaser, reason, risk, recommendation },
        market_timing: { score, teaser, reason, risk, recommendation },
        technical_feasibility: { score, teaser, reason, risk, recommendation },
        competitive_moat: { score, teaser, reason, risk, recommendation },
        founder_market_fit: { score, teaser, reason, risk, recommendation }
      }
    }
    ```

---

## 6. BuildTime AI (Project Estimator Tool)

BuildTime AI is a professional software estimation scoping system that evaluates project dimensions, features, complexity levels, team size, delivery timelines, and risk multipliers to generate a comprehensive scoping assessment report.

### Core File Locations
* **Estimation Configuration / Catalog**: [src/lib/buildtime/config.ts](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/lib/buildtime/config.ts)
  * Defines features catalog base hour weights (e.g., Auth is 24 hours, payments is 40 hours).
  * Defines multipliers for cross-platform apps, development velocity prioritized tradeoffs, requirements clarity, data migration, and compliance audits.
* **Scoping Core Logic Engine**: [src/lib/buildtime/estimator.ts](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/lib/buildtime/estimator.ts)
  * Implements `calculateEstimate()` which takes input answers and combines base effort weights with multipliers to output person-weeks, suggested teams, top project risks, and MVP scope suggestions.
* **Wizard Questionnaire UI**: [src/components/buildtime/WizardStep.tsx](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/components/buildtime/WizardStep.tsx)
* **Results Report Dashboard**: [src/components/buildtime/ResultsDashboard.tsx](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/components/buildtime/ResultsDashboard.tsx)
* **Estimations History List**: [src/components/buildtime/HistoryList.tsx](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/components/buildtime/HistoryList.tsx)
* **Page Layout / Routing**: [src/app/buildtime/page.tsx](file:///C:/Users/dhars/Downloads/crestcode-idea-validator/src/app/buildtime/page.tsx)

