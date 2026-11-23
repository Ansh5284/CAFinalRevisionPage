import type {
  DescriptiveEvaluationResult,
  DescriptiveQuestion,
  QuizDataset,
} from '../types/quiz';

export const SAMPLE_QUIZZES: QuizDataset[] = [
  {
    id: 'fr-daily-2026-11-23',
    title: 'Financial Reporting — Ind AS Deep Concept Drill (Sample Schema)',
    subjectId: 'financial-reporting',
    publishedDate: '2026-11-23',
    cadence: 'daily',
    totalMarks: 10,
    durationMinutes: 15,
    negativeMarking: 0,
    generatedBy: 'Gemini Tasks JSON Schema Preview',
    questions: [
      {
        id: 'fr-q1',
        chapter: 'Ind AS 115: Revenue from Contracts with Customers',
        standardRef: 'Ind AS 115 · Para 20–21',
        caseScenario:
          'Helios Tech Ltd. contracts to supply 100 customized industrial sensors at Rs. 10,000 each. After delivering 60 units, the customer adds 40 additional distinct units at Rs. 7,500 each, which reflects a special bulk discount NOT equal to the standalone selling price (SSP of Rs. 9,500).',
        question:
          'How should Helios Tech Ltd. account for this contract modification under Ind AS 115?',
        options: [
          'As a separate contract because the 40 additional sensors are distinct goods.',
          'Prospectively, as termination of the existing contract and creation of a new contract blending the remaining 40 original units and 40 new units.',
          'Retrospectively with a cumulative catch-up adjustment to revenue already recognized on the first 60 units.',
          'Defer recognition of the 40 new units until all 100 original units are delivered.',
        ],
        correctOptionIndex: 1,
        marks: 2,
        explanation:
          'Under Ind AS 115 Para 20, a modification is a separate contract ONLY if both (a) additional goods are distinct AND (b) the price increases by an amount reflecting their standalone selling price (SSP). Because Rs. 7,500 does not reflect SSP (Rs. 9,500) yet the remaining goods are distinct, Para 21(a) mandates prospective accounting (termination of old contract + creation of new contract with a blended price of [(40 × 10,000) + (40 × 7,500)] / 80 = Rs. 8,750 per remaining unit).',
      },
      {
        id: 'fr-q2',
        chapter: 'Ind AS 116: Leases',
        standardRef: 'Ind AS 116 · Para 46(a)',
        caseScenario:
          'Orion Logistics leases 10,000 sq. ft. of warehouse space for 8 years. At the start of Year 4, both parties agree to reduce the leased space to 6,000 sq. ft. for the remaining 5 years with a proportionate reduction in rent.',
        question:
          'What is the immediate accounting impact of this 40% reduction in leased floor space?',
        options: [
          'Remeasure Lease Liability using the revised discount rate and adjust 100% of the difference against the Right-of-Use (ROU) asset.',
          'Derecognize 40% of the ROU asset and 40% of the Lease Liability, recognizing the resulting difference directly in Profit or Loss; then remeasure the remaining Lease Liability at the revised discount rate against the ROU asset.',
          'Continue amortizing the original ROU asset and recognize reduced rent as a lease incentive over 5 years.',
          'Recognize an impairment loss under Ind AS 36 for the surrendered space only.',
        ],
        correctOptionIndex: 1,
        marks: 2,
        explanation:
          'Under Ind AS 116 Para 46(a), a modification that decreases the scope of a lease requires a two-step adjustment: first, proportionately reduce the carrying amount of the ROU asset and Lease Liability to reflect partial termination, taking any gain/loss directly to Profit or Loss; second, remeasure the remaining Lease Liability using the revised discount rate at the modification date with a corresponding adjustment to the ROU asset.',
      },
      {
        id: 'fr-q3',
        chapter: 'Ind AS 103: Business Combinations',
        standardRef: 'Ind AS 103 · Para 53',
        question:
          'During an acquisition of 80% equity in Sigma Mills Ltd., the acquirer incurs Rs. 45 lakh in legal due diligence fees and Rs. 18 lakh in stamp duty & issue costs for newly allotted equity shares paid as consideration. How are these costs treated?',
        options: [
          'Both Rs. 45 lakh and Rs. 18 lakh are capitalized into Goodwill.',
          'Rs. 45 lakh is expensed in P&L; Rs. 18 lakh equity issue cost is deducted directly from Equity under Ind AS 32.',
          'Both Rs. 45 lakh and Rs. 18 lakh are expensed in P&L immediately.',
          'Rs. 45 lakh is amortized over 5 years; Rs. 18 lakh is added to consideration transferred.',
        ],
        correctOptionIndex: 1,
        marks: 2,
        explanation:
          'Ind AS 103 Para 53 requires all acquisition-related advisory, legal, and valuation fees (Rs. 45 lakh) to be expensed in Profit or Loss when incurred. However, costs to issue equity securities (Rs. 18 lakh) are governed by Ind AS 32 and accounted for as a direct deduction from equity.',
      },
      {
        id: 'fr-q4',
        chapter: 'Ind AS 109: Financial Instruments',
        standardRef: 'Ind AS 109 · Para 5.5.4',
        question:
          'A corporate bond measured at Amortized Cost suffers a significant increase in credit risk (Stage 2), though no default event has yet occurred. How are Expected Credit Losses (ECL) and interest revenue recognized?',
        options: [
          '12-month ECL; effective interest calculated on Gross carrying amount.',
          'Lifetime ECL; effective interest calculated on Gross carrying amount.',
          'Lifetime ECL; effective interest calculated on Net carrying amount (Gross less Loss Allowance).',
          'No ECL until actual default occurs (incurred loss model).',
        ],
        correctOptionIndex: 1,
        marks: 2,
        explanation:
          'In Stage 2 (Significant Increase in Credit Risk without objective credit impairment), Ind AS 109 requires recognizing Lifetime ECL, while effective interest revenue continues to be calculated on the Gross carrying amount. Net carrying amount is used only in Stage 3 (credit-impaired).',
      },
      {
        id: 'fr-q5',
        chapter: 'Ind AS 115: Revenue from Contracts with Customers',
        standardRef: 'Ind AS 115 · Para B30',
        question:
          'An appliance manufacturer provides a mandatory 1-year statutory defect warranty plus sells an optional 2-year extended breakdown cover separately. How should both warranties be accounted for?',
        options: [
          'Account for both warranties as a single provision under Ind AS 37.',
          'Defer revenue for both warranties over 3 years under Ind AS 115.',
          '1-year statutory warranty as a provision under Ind AS 37; 2-year extended cover as a separate performance obligation under Ind AS 115.',
          'Expense repair costs for both warranties only when customer claims arise.',
        ],
        correctOptionIndex: 2,
        marks: 2,
        explanation:
          'Assurance-type warranties (1-year statutory defect warranty) are accounted for as cost provisions under Ind AS 37. Because the 2-year extended cover can be purchased separately, it is a service-type warranty and must be allocated part of the transaction price as a distinct performance obligation under Ind AS 115.',
      },
    ],
  },
  {
    id: 'aa-weekly-2026-11-22',
    title: 'Advanced Audit — SAs & Reporting Weekly Assessment',
    subjectId: 'advanced-audit',
    publishedDate: '2026-11-22',
    cadence: 'weekly',
    totalMarks: 6,
    durationMinutes: 10,
    negativeMarking: 0,
    generatedBy: 'Gemini Tasks JSON Schema Preview',
    questions: [
      {
        id: 'aa-q1',
        chapter: 'SA 701 & SA 705: Audit Reporting',
        standardRef: 'SA 705 · Para 29',
        question:
          'Due to a severe ransomware attack that wiped out primary inventory and sales ledgers for 9 months, the statutory auditor of a listed company issues a Disclaimer of Opinion. How should Key Audit Matters (SA 701) be handled?',
        options: [
          'Include a KAM section explaining the ransomware incident in detail.',
          'Do NOT include a Key Audit Matters section in the auditor report unless required by law or regulation.',
          'Move the ransomware disclosure to an Emphasis of Matter paragraph instead of Basis for Disclaimer.',
          'Issue an Adverse Opinion so KAM can be reported.',
        ],
        correctOptionIndex: 1,
        marks: 2,
        explanation:
          'Under SA 705 Para 29, when the auditor disclaims an opinion on the financial statements, the auditor report shall NOT include a Key Audit Matters section in accordance with SA 701 (unless explicitly mandated by law), because highlighting individual matters could suggest the financial statements as a whole are more credible than they are.',
      },
      {
        id: 'aa-q2',
        chapter: 'SQC 1: Quality Control for Firms',
        standardRef: 'SQC 1 · Para 74–76',
        question:
          'What is the maximum ordinary period for assembling the final audit engagement file after the date of the auditor report, and the minimum retention period under SQC 1?',
        options: [
          '30 days assembly; 5 years retention',
          '60 days assembly; 7 years retention',
          '90 days assembly; 8 years retention',
          '45 days assembly; 7 years retention',
        ],
        correctOptionIndex: 1,
        marks: 2,
        explanation:
          'SQC 1 specifies that assembly of the final engagement file should ordinarily be completed in not more than 60 days after the date of the auditor report, and the retention period for audit engagements ordinarily is no shorter than 7 years from the date of the auditor report.',
      },
      {
        id: 'aa-q3',
        chapter: 'SA 315 & SA 330: Risk Assessment',
        standardRef: 'SA 330 · Para 21',
        question:
          'When an auditor identifies a Significant Risk (e.g., revenue cutoff fraud risk), which substantive audit approach is mandatory if the auditor does NOT test operating effectiveness of controls?',
        options: [
          'Substantive analytical procedures alone are sufficient.',
          'Substantive procedures must specifically include Tests of Details.',
          'Inquiry of management and written representations under SA 580 suffice.',
          'Decrease sample sizes because inherent risk is already documented.',
        ],
        correctOptionIndex: 1,
        marks: 2,
        explanation:
          'Under SA 330 Para 21, when the approach to a significant risk consists only of substantive procedures, those procedures MUST include Tests of Details—relying solely on substantive analytical procedures is never permitted for a significant risk.',
      },
    ],
  },
];

export const GEMINI_QUIZ_JSON_TEMPLATE = `{
  "id": "fr-daily-2026-11-24",
  "title": "Financial Reporting — 100 Marks Daily MCQ Challenge",
  "subjectId": "financial-reporting",
  "publishedDate": "2026-11-24",
  "cadence": "daily",
  "totalMarks": 100,
  "durationMinutes": 90,
  "negativeMarking": 0,
  "generatedBy": "Gemini Tasks",
  "questions": [
    {
      "id": "q1",
      "chapter": "Ind AS 115: Revenue from Contracts with Customers",
      "standardRef": "Ind AS 115 · Para 35",
      "caseScenario": "Optional 2-3 line CA Final exam case scenario...",
      "question": "Which criterion establishes over-time revenue recognition?",
      "options": [
        "Option A text",
        "Option B text",
        "Option C text",
        "Option D text"
      ],
      "correctOptionIndex": 1,
      "marks": 2,
      "explanation": "Detailed conceptual reasoning referencing the exact Ind AS paragraph."
    }
  ]
}`;

export const SAMPLE_DESCRIPTIVE_QUESTIONS: DescriptiveQuestion[] = [
  {
    id: 'desc-fr-01',
    subjectId: 'financial-reporting',
    chapter: 'Ind AS 116: Sale and Leaseback',
    standardRef: 'Ind AS 116 · Para 98–103',
    marks: 8,
    prompt:
      'Zenith Manufacturing Ltd. sells a factory building to Apex Finance for Rs. 600 lakh (Fair Value: Rs. 540 lakh; Carrying Amount: Rs. 400 lakh) and immediately leases it back for 10 years at annual rent of Rs. 65 lakh (PV of lease payments at 9% implicit rate is Rs. 417.15 lakh). Transfer qualifies as a sale under Ind AS 115. Compute the initial ROU Asset, Lease Liability, Financial Liability, and Gain recognized in P&L with journal entries.',
    caseFacts: [
      'Sale proceeds (Rs. 600 lakh) exceed Fair Value (Rs. 540 lakh) by Rs. 60 lakh -> Additional Financing.',
      'PV of annual lease payments attributable to lease = Rs. 417.15 lakh - Rs. 60 lakh = Rs. 357.15 lakh.',
      'Retained right-of-use proportion = Rs. 357.15 / Rs. 540 = 66.14% of carrying amount (Rs. 400 lakh).',
    ],
    expectedChecklist: [
      'Identify Rs. 60 lakh excess above Fair Value as additional financing under Para 101(b).',
      'Separate total PV (Rs. 417.15 lakh) into Lease Liability (Rs. 357.15 lakh) and Financial Liability (Rs. 60 lakh).',
      'Measure ROU Asset at proportionate carrying amount: (357.15 / 540) × 400 = Rs. 264.56 lakh.',
      'Recognize gain ONLY on rights transferred: Total gain (540 - 400 = 140) × [(540 - 357.15)/540] = Rs. 47.41 lakh.',
    ],
  },
  {
    id: 'desc-aa-01',
    subjectId: 'advanced-audit',
    chapter: 'SA 705 & SA 570: Going Concern & Reporting',
    standardRef: 'SA 570 · Para 21–23 & SA 705',
    marks: 6,
    prompt:
      'During the statutory audit of Delta Textiles Ltd., you note that net worth is fully eroded, major lenders have recalled credit facilities, and management refuses to disclose the Material Uncertainty Related to Going Concern in the notes to financial statements. State the auditor reporting responsibilities under SA 570 and SA 705.',
    caseFacts: [
      'Going concern basis is still deemed appropriate by management, but material uncertainty exists.',
      'Management omits adequate disclosure in the notes to accounts.',
    ],
    expectedChecklist: [
      'Distinguish between adequate disclosure (separate MURGC paragraph under Para 22) vs inadequate disclosure (Para 23).',
      'Express Qualified or Adverse Opinion under SA 705 depending on pervasiveness.',
      'State in the Basis for Qualified/Adverse Opinion section that a material uncertainty exists and financial statements do not adequately disclose this matter.',
      'Communicate the modification and wording with Those Charged with Governance (TCWG) under SA 260/570.',
    ],
  },
  {
    id: 'desc-afm-01',
    subjectId: 'advanced-financial-management',
    chapter: 'Forex Hedging: Money Market vs Forward',
    standardRef: 'AFM · Forex Risk Management',
    marks: 8,
    prompt:
      'An Indian exporter expects USD 500,000 in 3 months. Spot rate is Rs. 83.20/83.35, 3-month forward is Rs. 83.85/84.05. Annualized interest rates: USD 5%–6% p.a., INR 8%–9.5% p.a. Evaluate whether a Forward Cover or Money Market Hedge yields higher INR realization.',
    caseFacts: [
      'Exporter has a 3-month USD receivable -> sells USD at Bid rates.',
      'Money market hedge requires borrowing USD at 6% p.a. (1.5% for 3 months) and investing INR at 8% p.a. (2% for 3 months).',
    ],
    expectedChecklist: [
      'Forward Cover inflow = $500,000 × Rs. 83.85 = Rs. 4,19,25,000.',
      'USD loan amount = $500,000 / 1.015 = $492,610.84; converted at Spot Bid Rs. 83.20 = Rs. 4,09,85,222.',
      'INR maturity value after 3 months @ 2% = Rs. 4,09,85,222 × 1.02 = Rs. 4,18,04,926.',
      'Conclude Forward Cover is superior by Rs. 1,20,074.',
    ],
  },
];

export const SAMPLE_EVALUATIONS: Record<string, DescriptiveEvaluationResult> = {
  'CA-2026-DEMO1': {
    trackingId: 'CA-2026-DEMO1',
    evaluatedAt: '2026-11-22 19:45 IST',
    awardedMarks: 6.5,
    maxMarks: 8,
    summaryVerdict:
      'Strong application of Ind AS 116 sale-and-leaseback mechanics with accurate separation of off-market financing. Minor deduction for omitting the explicit Ind AS 115 transfer-of-control prerequisite check before applying Para 100.',
    correctPoints: [
      'Correctly isolated Rs. 60 lakh (Rs. 600 lakh - Rs. 540 lakh) as additional financing under Ind AS 116 Para 101(b).',
      'Accurately computed net lease liability (Rs. 357.15 lakh) and proportionate ROU asset carrying amount (Rs. 264.56 lakh).',
      'Balanced the initial recognition journal entry with the exact partial gain of Rs. 47.41 lakh credited to Profit or Loss.',
    ],
    missingOrIncorrectPoints: [
      'Did not explicitly state the threshold step: verifying that the transfer qualifies as a sale under Ind AS 115 (if not, entire Rs. 600 lakh would be a financial liability under Ind AS 109).',
      'Omitted brief note on subsequent depreciation of ROU asset over the 10-year lease term.',
    ],
    standardReferencesCited: ['Ind AS 116 Para 100(a)', 'Ind AS 116 Para 101(b)'],
    improvementGuidance:
      'In CA Final FR papers, always open Sale & Leaseback answers with a 2-line statutory rule block citing Ind AS 115 control transfer before starting numerical working notes. This secures the full 1.5 presentation/concept marks.',
  },
};
