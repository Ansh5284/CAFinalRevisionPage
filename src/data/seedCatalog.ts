import { SUBJECT_CONFIGS } from '../config/driveConfig';
import type { ChapterGroup, StudyArtifact, SubjectCatalog, SubjectId } from '../types/archive';

interface SeedChapterBlueprint {
  chapterNumber: number;
  chapterKey: string;
  chapterTitle: string;
  standards: string[];
  artifacts: Omit<StudyArtifact, 'subjectId' | 'chapterKey' | 'chapterTitle'>[];
}

const SEED_BLUEPRINTS: Record<SubjectId, SeedChapterBlueprint[]> = {
  'financial-reporting': [
    {
      chapterNumber: 1,
      chapterKey: 'ind-as-115',
      chapterTitle: 'Revenue from Contracts with Customers',
      standards: ['Ind AS 115'],
      artifacts: [
        {
          id: 'fr-115-mod',
          title: 'Ind AS 115 Comprehensive Study Module',
          fileName: 'Ch 01 - Ind AS 115 Comprehensive Study Module.pdf',
          category: 'module',
          format: 'pdf',
          standards: ['Ind AS 115'],
          mimeType: 'application/pdf',
          sizeLabel: '14.2 MB',
          modifiedAt: '2026-10-18',
          folderPath: ['Modules'],
          previewSlides: [
            {
              heading: 'Core Principle & Five-Step Recognition Framework',
              standardRef: 'Ind AS 115 · Para 2–9',
              keyPoints: [
                'Recognize revenue to depict the transfer of promised goods or services to customers in an amount reflecting the consideration expected in exchange.',
                'Step 1: Identify the contract(s) with a customer (commercial substance, probable collection, enforceable rights).',
                'Step 2: Identify distinct performance obligations (capable of being distinct + distinct within the context of the contract).',
                'Step 3: Determine transaction price including variable consideration (expected value vs most likely amount, subject to constraint).',
              ],
              examTip: 'Always verify whether a significant financing component exists when payment timing differs by > 12 months.',
            },
            {
              heading: 'Step 4 & Step 5: Allocation and Satisfaction',
              standardRef: 'Ind AS 115 · Para 31–76',
              keyPoints: [
                'Allocate transaction price in proportion to Standalone Selling Prices (SSP); use adjusted market assessment, expected cost plus margin, or residual approach.',
                'Control transfers Over Time if any of 3 criteria are met: simultaneous receipt & consumption, customer controls asset as created/enhanced, or no alternative use + enforceable right to payment.',
                'Otherwise, recognize revenue at a Point in Time when control transfers (present right to payment, legal title, physical possession, risks & rewards, acceptance).',
              ],
              examTip: 'In construction and software licensing questions, test all three over-time criteria explicitly before concluding point-in-time.',
            },
          ],
        },
        {
          id: 'fr-115-slides',
          title: 'Ind AS 115 High-Yield Revision Slides',
          fileName: 'Ind AS 115 High-Yield Revision Slides.pptx',
          category: 'revision-slide',
          format: 'slides',
          standards: ['Ind AS 115'],
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          sizeLabel: '5.8 MB',
          modifiedAt: '2026-11-04',
          folderPath: ['Revision Slides & Infographics', 'Ind AS 115'],
          previewSlides: [
            {
              heading: 'Quick Revision: Variable Consideration & Constraint',
              standardRef: 'Ind AS 115 · Para 50–58',
              keyPoints: [
                'Include variable consideration only to the extent it is highly probable that a significant reversal in cumulative revenue will NOT occur.',
                'Refund liabilities are recognized separately from the right-to-recover-goods asset (measured at former carrying amount less recovery costs).',
                'Non-cash consideration is measured at fair value at contract inception; subsequent fair value changes outside form of consideration are not adjusted in revenue.',
              ],
              examTip: 'Reassess variable consideration estimates at the end of every reporting period.',
            },
            {
              heading: 'Principal vs Agent & Warranties',
              standardRef: 'Ind AS 115 · Para B28–B38',
              keyPoints: [
                'Principal controls the good/service before transfer to the customer -> recognize Gross revenue; Agent arranges provision -> recognize Net commission.',
                'Assurance-type warranty -> Provision under Ind AS 37; Service-type warranty (purchased separately or provides additional service) -> Separate performance obligation.',
              ],
            },
          ],
        },
        {
          id: 'fr-115-infographic',
          title: 'Contract Modification Flowchart & 5-Step Chart',
          fileName: 'Ind AS 115 Contract Modification Flowchart Infographic.png',
          category: 'infographic',
          format: 'image',
          standards: ['Ind AS 115'],
          mimeType: 'image/png',
          sizeLabel: '2.4 MB',
          modifiedAt: '2026-11-09',
          folderPath: ['Revision Slides & Infographics', 'Ind AS 115'],
          previewDiagram: 'ind-as-115-five-step',
        },
      ],
    },
    {
      chapterNumber: 2,
      chapterKey: 'ind-as-116',
      chapterTitle: 'Leases & Right-of-Use Accounting',
      standards: ['Ind AS 116'],
      artifacts: [
        {
          id: 'fr-116-mod',
          title: 'Ind AS 116 Complete Lease Accounting Module',
          fileName: 'Ch 02 - Ind AS 116 Complete Lease Accounting Module.pdf',
          category: 'module',
          format: 'pdf',
          standards: ['Ind AS 116'],
          mimeType: 'application/pdf',
          sizeLabel: '16.8 MB',
          modifiedAt: '2026-10-20',
          folderPath: ['Modules'],
          previewSlides: [
            {
              heading: 'Lessee Model: Single On-Balance-Sheet Recognition',
              standardRef: 'Ind AS 116 · Para 22–38',
              keyPoints: [
                'At commencement date, recognize Right-of-Use (ROU) Asset and Lease Liability for all leases except optional exemptions (short-term <= 12 months without purchase option, or low-value underlying assets).',
                'Lease Liability = PV of unpaid lease payments discounted at interest rate implicit in lease (or incremental borrowing rate).',
                'ROU Asset = Lease Liability + initial direct costs + prepaid lease payments - lease incentives received + dismantling obligation (Ind AS 37).',
              ],
              examTip: 'Variable lease payments linked to an index/rate (CPI) are included initially; sales/usage-based variable payments are expensed as incurred.',
            },
            {
              heading: 'Sale and Leaseback Transactions',
              standardRef: 'Ind AS 116 · Para 98–103',
              keyPoints: [
                'First test whether the transfer satisfies Ind AS 115 requirements for a sale.',
                'If a sale occurs: measure ROU asset at proportion of previous carrying amount relating to right of use retained; recognize gain/loss ONLY on rights transferred to buyer-lessor.',
                'Adjust any off-market sale proceeds (above fair value = additional financing; below fair value = prepayment of lease payments).',
              ],
            },
          ],
        },
        {
          id: 'fr-116-slides',
          title: 'Lease Modification & Reassessment Revision Deck',
          fileName: 'Ind AS 116 Lease Modification Revision Slides.pptx',
          category: 'revision-slide',
          format: 'slides',
          standards: ['Ind AS 116'],
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          sizeLabel: '4.9 MB',
          modifiedAt: '2026-11-02',
          folderPath: ['Revision Slides & Infographics', 'Ind AS 116'],
          previewSlides: [
            {
              heading: 'Scope Reduction vs Scope Increase Modifications',
              standardRef: 'Ind AS 116 · Para 44–46',
              keyPoints: [
                'Separate Lease: ONLY if scope increases by adding right to use additional underlying assets AND consideration increases commensurate with SSP.',
                'Decrease in Scope (e.g. reducing leased floor area): proportionately decrease ROU asset and Lease Liability; book difference directly to P&L!',
                'Other Modifications (e.g. extending lease term): remeasure Lease Liability using revised discount rate and adjust ROU asset (no immediate P&L impact).',
              ],
            },
          ],
        },
      ],
    },
    {
      chapterNumber: 3,
      chapterKey: 'ind-as-103-110',
      chapterTitle: 'Business Combinations & Consolidated Financial Statements',
      standards: ['Ind AS 103', 'Ind AS 110', 'Ind AS 28'],
      artifacts: [
        {
          id: 'fr-103-mod',
          title: 'Ind AS 103 & 110 Consolidation Study Module',
          fileName: 'Ch 03 - Ind AS 103 and Ind AS 110 Consolidation Module.pdf',
          category: 'module',
          format: 'pdf',
          standards: ['Ind AS 103', 'Ind AS 110'],
          mimeType: 'application/pdf',
          sizeLabel: '29.4 MB',
          modifiedAt: '2026-10-12',
          folderPath: ['Modules'],
          previewSlides: [
            {
              heading: 'Acquisition Method & Goodwill / Bargain Purchase',
              standardRef: 'Ind AS 103 · Para 4–36',
              keyPoints: [
                'Goodwill = Consideration Transferred + NCI (Fair Value or Proportionate Net Assets) + Acquisition-date FV of previously held equity interest - Fair Value of Identifiable Net Assets.',
                'Acquisition-related transaction costs (legal, advisory) are expensed in P&L as incurred—never capitalized into goodwill.',
                'Bargain Purchase Gain in Ind AS 103 is recognized in OCI (and accumulated in Capital Reserve) or directly in Capital Reserve if clear evidence is absent.',
              ],
            },
          ],
        },
        {
          id: 'fr-103-info',
          title: 'Accounting Cycle & Consolidation Elimination Chart',
          fileName: 'Ind AS 110 Consolidation Elimination Infographic.jpg',
          category: 'infographic',
          format: 'image',
          standards: ['Ind AS 110', 'Ind AS 103'],
          mimeType: 'image/jpeg',
          sizeLabel: '3.1 MB',
          modifiedAt: '2026-11-11',
          folderPath: ['Revision Slides & Infographics', 'Ind AS 103 & 110'],
          previewDiagram: 'accounting-cycle-image',
        },
      ],
    },
    {
      chapterNumber: 4,
      chapterKey: 'ind-as-109',
      chapterTitle: 'Financial Instruments Classification, Impairment & Hedging',
      standards: ['Ind AS 109', 'Ind AS 32', 'Ind AS 107'],
      artifacts: [
        {
          id: 'fr-109-mod',
          title: 'Financial Instruments Complete Reference Module',
          fileName: 'Ch 04 - Ind AS 109 Financial Instruments Module.pdf',
          category: 'module',
          format: 'pdf',
          standards: ['Ind AS 109', 'Ind AS 32'],
          mimeType: 'application/pdf',
          sizeLabel: '24.6 MB',
          modifiedAt: '2026-10-28',
          folderPath: ['Modules'],
          previewSlides: [
            {
              heading: 'SPPI & Business Model Classification Matrix',
              standardRef: 'Ind AS 109 · Para 4.1.1–4.1.5',
              keyPoints: [
                'Amortized Cost: Hold-to-collect business model + Cash flows are Solely Payments of Principal and Interest (SPPI).',
                'FVOCI (Debt): Hold-to-collect AND sell + SPPI passes (gains recycled to P&L on derecognition).',
                'FVTPL: Default residual category for derivatives, trading assets, and instruments failing SPPI.',
                'Irrevocable FVOCI election for non-trading equity instruments: fair value changes NEVER recycle to P&L.',
              ],
            },
          ],
        },
        {
          id: 'fr-109-slides',
          title: 'ECL 3-Stage Impairment & Compound Instruments Slides',
          fileName: 'Ind AS 109 ECL and Compound Instruments Revision Slides.pptx',
          category: 'revision-slide',
          format: 'slides',
          standards: ['Ind AS 109', 'Ind AS 32'],
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          sizeLabel: '6.2 MB',
          modifiedAt: '2026-11-14',
          folderPath: ['Revision Slides & Infographics', 'Ind AS 109'],
          previewSlides: [
            {
              heading: 'Expected Credit Loss (ECL) Three-Stage Model',
              standardRef: 'Ind AS 109 · Para 5.5',
              keyPoints: [
                'Stage 1 (Performing): 12-month ECL; interest calculated on Gross carrying amount.',
                'Stage 2 (Significant Increase in Credit Risk — 30+ DPD rebuttable presumption): Lifetime ECL; interest on Gross carrying amount.',
                'Stage 3 (Credit-Impaired): Lifetime ECL; interest calculated on Net carrying amount (Gross less Loss Allowance).',
              ],
            },
          ],
        },
      ],
    },
  ],

  'advanced-audit': [
    {
      chapterNumber: 1,
      chapterKey: 'sa-315-330',
      chapterTitle: 'Risk Assessment, Internal Control & Audit Responses',
      standards: ['SA 315', 'SA 330', 'SA 320'],
      artifacts: [
        {
          id: 'aa-315-mod',
          title: 'SA 315 & SA 330 Risk Assessment Study Module',
          fileName: 'Ch 01 - SA 315 and SA 330 Risk Assessment Module.pdf',
          category: 'module',
          format: 'pdf',
          standards: ['SA 315', 'SA 330'],
          mimeType: 'application/pdf',
          sizeLabel: '11.4 MB',
          modifiedAt: '2026-10-16',
          folderPath: ['Modules'],
          previewSlides: [
            {
              heading: 'Identifying & Assessing Risks of Material Misstatement (RoMM)',
              standardRef: 'SA 315 · Para 5–29',
              keyPoints: [
                'Risk Assessment Procedures must combine Inquiries, Analytical Procedures, and Observation & Inspection.',
                'Understand the 5 components of Internal Control: Control Environment, Entity Risk Assessment, Information System, Control Activities, and Monitoring.',
                'Significant Risks require special audit consideration (fraud risk, complex/unusual transactions, related party transactions, subjective estimates) and cannot rely solely on substantive analytical procedures.',
              ],
            },
          ],
        },
        {
          id: 'aa-315-infographic',
          title: 'Audit Risk Model & RoMM Response Flowchart',
          fileName: 'SA 315 Audit Risk Model Infographic.png',
          category: 'infographic',
          format: 'image',
          standards: ['SA 315', 'SA 330'],
          mimeType: 'image/png',
          sizeLabel: '1.9 MB',
          modifiedAt: '2026-11-08',
          folderPath: ['Revision Slides & Infographics', 'SA 315 & SA 330'],
          previewDiagram: 'audit-risk-model',
        },
        {
          id: 'aa-315-slides',
          title: 'Materiality & Assertions Quick Revision Deck',
          fileName: 'SA 320 Materiality and Assertions Revision Slides.pptx',
          category: 'revision-slide',
          format: 'slides',
          standards: ['SA 320', 'SA 315'],
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          sizeLabel: '3.7 MB',
          modifiedAt: '2026-11-06',
          folderPath: ['Revision Slides & Infographics', 'SA 315 & SA 330'],
          previewSlides: [
            {
              heading: 'Overall vs Performance Materiality',
              standardRef: 'SA 320 · Para 9–13',
              keyPoints: [
                'Performance Materiality is set LOWER than overall materiality to reduce the probability that aggregate uncorrected & undetected misstatements exceed overall materiality.',
                'Revise materiality if new information during the audit would have caused a different initial determination.',
              ],
            },
          ],
        },
      ],
    },
    {
      chapterNumber: 2,
      chapterKey: 'sa-700-705',
      chapterTitle: 'Audit Reporting, Key Audit Matters & Modifications',
      standards: ['SA 700', 'SA 701', 'SA 705', 'SA 706'],
      artifacts: [
        {
          id: 'aa-700-mod',
          title: 'SA 700 Series Audit Reporting Module',
          fileName: 'Ch 02 - SA 700 701 705 706 Reporting Module.pdf',
          category: 'module',
          format: 'pdf',
          standards: ['SA 700', 'SA 701', 'SA 705', 'SA 706'],
          mimeType: 'application/pdf',
          sizeLabel: '13.9 MB',
          modifiedAt: '2026-10-25',
          folderPath: ['Modules'],
          previewSlides: [
            {
              heading: 'Modified Opinion Decision Matrix (SA 705)',
              standardRef: 'SA 705 · Para 6–10',
              keyPoints: [
                'Material but NOT Pervasive -> Qualified Opinion ("Except for...").',
                'Material AND Pervasive (Misstatement) -> Adverse Opinion ("Do not give a true and fair view").',
                'Material AND Pervasive (Inability to obtain SAAE) -> Disclaimer of Opinion ("We do not express an opinion").',
                'When disclaiming an opinion under SA 705, the auditor MUST NOT include a Key Audit Matters (SA 701) section.',
              ],
            },
          ],
        },
        {
          id: 'aa-700-slides',
          title: 'EOM vs OM vs KAM Comparison Revision Slides',
          fileName: 'SA 701 and SA 706 EOM OM KAM Revision Slides.pptx',
          category: 'revision-slide',
          format: 'slides',
          standards: ['SA 701', 'SA 706'],
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          sizeLabel: '4.1 MB',
          modifiedAt: '2026-11-12',
          folderPath: ['Revision Slides & Infographics', 'SA 700 Series'],
          previewSlides: [
            {
              heading: 'Distinguishing EOM, OM, and KAM',
              standardRef: 'SA 701 & SA 706',
              keyPoints: [
                'Key Audit Matters (SA 701): Mandatory for listed entities; matters of most significance in the current period audit communicated with TCWG.',
                'Emphasis of Matter (SA 706): Matter appropriately presented/disclosed in financial statements that is fundamental to users understanding (and NOT already a KAM).',
                'Other Matter (SA 706): Matter NOT presented/disclosed in financial statements that is relevant to users understanding of the audit or auditor responsibilities.',
              ],
            },
          ],
        },
      ],
    },
    {
      chapterNumber: 3,
      chapterKey: 'sqc-1-sa-220',
      chapterTitle: 'Quality Control for Firms & Audit Engagements',
      standards: ['SQC 1', 'SA 220'],
      artifacts: [
        {
          id: 'aa-sqc-mod',
          title: 'SQC 1 & SA 220 Quality Management Module',
          fileName: 'Ch 03 - SQC 1 and SA 220 Quality Control Module.pdf',
          category: 'module',
          format: 'pdf',
          standards: ['SQC 1', 'SA 220'],
          mimeType: 'application/pdf',
          sizeLabel: '9.6 MB',
          modifiedAt: '2026-10-19',
          folderPath: ['Modules'],
          previewSlides: [
            {
              heading: 'Six Elements of Quality Control & EQCR',
              standardRef: 'SQC 1 · Para 11 & 60–73',
              keyPoints: [
                'Six Elements: Leadership Responsibilities, Ethical Requirements, Acceptance & Continuance, Human Resources, Engagement Performance, Monitoring.',
                'Engagement Quality Control Review (EQCR) is mandatory for all audits of financial statements of listed entities before the audit report is dated.',
                'Assembly of final engagement file: complete within 60 days of the auditor report date; retention period minimum 7 years.',
              ],
            },
          ],
        },
        {
          id: 'aa-sqc-slides',
          title: 'CARO 2020 Clauses & Professional Ethics Summary',
          fileName: 'CARO 2020 and Ethics Clauses Revision Slides.pptx',
          category: 'revision-slide',
          format: 'slides',
          standards: ['CARO 2020', 'SQC 1'],
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          sizeLabel: '5.2 MB',
          modifiedAt: '2026-11-15',
          folderPath: ['Revision Slides & Infographics', 'SQC 1 & CARO'],
          previewSlides: [
            {
              heading: 'High-Frequency CARO 2020 Reporting Triggers',
              standardRef: 'CARO 2020 · Clause 3(i)–(xxi)',
              keyPoints: [
                'Clause 3(i)(e): Proceedings initiated or pending under Benami Transactions Act.',
                'Clause 3(ii)(b): Working capital limits > Rs. 5 crore sanctioned on security of current assets — verify quarterly returns match books.',
                'Clause 3(xi): Fraud reporting including whistle-blower complaints received during the year.',
              ],
            },
          ],
        },
      ],
    },
  ],

  'advanced-financial-management': [
    {
      chapterNumber: 1,
      chapterKey: 'forex-hedging',
      chapterTitle: 'Foreign Exchange Exposure & Risk Management',
      standards: ['FEDAI Rules', 'IRPT / PPPT'],
      artifacts: [
        {
          id: 'afm-fx-mod',
          title: 'Foreign Exchange Exposure & Hedging Study Module',
          fileName: 'Ch 01 - Foreign Exchange Exposure and Hedging Module.pdf',
          category: 'module',
          format: 'pdf',
          standards: ['FEDAI Rules', 'IRPT / PPPT'],
          mimeType: 'application/pdf',
          sizeLabel: '17.3 MB',
          modifiedAt: '2026-10-21',
          folderPath: ['Modules'],
          previewSlides: [
            {
              heading: 'Money Market Hedge vs Forward Contract Decision Rule',
              standardRef: 'AFM · Forex Hedging',
              keyPoints: [
                'For a Foreign Currency Receivable: Borrow PV of foreign receivable today -> Convert at Spot Bid -> Invest home currency at deposit rate -> Repay foreign loan from receivable.',
                'For a Foreign Currency Payable: Borrow home currency -> Convert at Spot Ask -> Invest PV of foreign payable at foreign deposit rate -> Settle payable at maturity.',
                'Interest Rate Parity (IRPT): Forward Premium/Discount approximately equals interest rate differential; arbitrage exists when actual forward differs from theoretical forward.',
              ],
            },
          ],
        },
        {
          id: 'afm-fx-infographic',
          title: 'Forex Hedging Decision Tree & Option Payoff Chart',
          fileName: 'Forex Hedging Decision Tree Infographic.png',
          category: 'infographic',
          format: 'image',
          standards: ['FEDAI Rules'],
          mimeType: 'image/png',
          sizeLabel: '2.1 MB',
          modifiedAt: '2026-11-10',
          folderPath: ['Revision Slides & Infographics', 'Forex Exposure'],
          previewDiagram: 'forex-hedging-tree',
        },
        {
          id: 'afm-fx-slides',
          title: 'Cancellation, Extension & Early Delivery Revision Slides',
          fileName: 'Forward Contract Cancellation and Rollover Slides.pptx',
          category: 'revision-slide',
          format: 'slides',
          standards: ['FEDAI Rules'],
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          sizeLabel: '4.4 MB',
          modifiedAt: '2026-11-13',
          folderPath: ['Revision Slides & Infographics', 'Forex Exposure'],
          previewSlides: [
            {
              heading: 'FEDAI Rule 6: Forward Contract Cancellation',
              standardRef: 'FEDAI Guidelines',
              keyPoints: [
                'Cancellation on Due Date: Cancel against opposite Spot rate (Purchase contract cancelled at TT Selling; Sale contract cancelled at TT Buying).',
                'Cancellation Before Due Date: Cancel against opposite Forward rate maturing on the original contract maturity date.',
                'Automatic Cancellation on Overdue Contract: Bank cancels at spot rate on expiry/grace date; swap loss recovered from customer, swap gain NOT passed on.',
              ],
            },
          ],
        },
      ],
    },
    {
      chapterNumber: 2,
      chapterKey: 'derivatives-valuation',
      chapterTitle: 'Derivatives Analysis, Futures & Options Valuation',
      standards: ['Black-Scholes', 'Binomial Model'],
      artifacts: [
        {
          id: 'afm-der-mod',
          title: 'Futures, Swaps & Options Valuation Module',
          fileName: 'Ch 02 - Derivatives Futures Swaps and Options Module.pdf',
          category: 'module',
          format: 'pdf',
          standards: ['Black-Scholes', 'Binomial Model'],
          mimeType: 'application/pdf',
          sizeLabel: '19.1 MB',
          modifiedAt: '2026-10-29',
          folderPath: ['Modules'],
          previewSlides: [
            {
              heading: 'Put-Call Parity & Option Greeks Summary',
              standardRef: 'AFM · Derivatives',
              keyPoints: [
                'Put-Call Parity (European): Call + PV(Strike) = Put + Spot (adjust Spot by subtracting PV of dividends if applicable).',
                'Delta measures sensitivity of option price to underlying price; Gamma measures rate of change of Delta; Vega measures sensitivity to volatility.',
                'Minimum hedge ratio using Index Futures = (Portfolio Value / Futures Contract Value) × (Target Beta - Current Beta).',
              ],
            },
          ],
        },
        {
          id: 'afm-der-slides',
          title: 'Interest Rate Swaps & Currency Swaps Revision Slides',
          fileName: 'Interest Rate and Currency Swaps Revision Slides.pptx',
          category: 'revision-slide',
          format: 'slides',
          standards: ['Black-Scholes'],
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          sizeLabel: '3.8 MB',
          modifiedAt: '2026-11-07',
          folderPath: ['Revision Slides & Infographics', 'Derivatives'],
          previewSlides: [
            {
              heading: 'Comparative Advantage Quality Spread Formula',
              standardRef: 'AFM · Swaps',
              keyPoints: [
                'Total Net Gain from Swap = |Fixed Rate Differential - Floating Rate Differential| - Intermediary Bank Commission.',
                'Each counterparty borrows in the market where it holds comparative advantage, then swaps payment streams to split the net gain.',
              ],
            },
          ],
        },
      ],
    },
    {
      chapterNumber: 3,
      chapterKey: 'mergers-acquisitions',
      chapterTitle: 'Mergers, Acquisitions & Corporate Restructuring',
      standards: ['Valuation', 'EPS Exchange Ratio'],
      artifacts: [
        {
          id: 'afm-ma-mod',
          title: 'Mergers, Synergy & Exchange Ratio Module',
          fileName: 'Ch 03 - Mergers Acquisitions and Restructuring Module.pdf',
          category: 'module',
          format: 'pdf',
          standards: ['Valuation'],
          mimeType: 'application/pdf',
          sizeLabel: '15.0 MB',
          modifiedAt: '2026-10-30',
          folderPath: ['Modules'],
          previewSlides: [
            {
              heading: 'Maximum & Minimum Exchange Ratio Bounds',
              standardRef: 'AFM · M&A Valuation',
              keyPoints: [
                'Maximum Exchange Ratio acquirer will pay (no MPS dilution): based on post-merger intrinsic share price >= pre-merger MPS of acquirer.',
                'Minimum Exchange Ratio target shareholders demand: post-merger value received >= pre-merger MPS of target.',
                'True Cost of Merger (Cash) = Cash Paid - PV(Target standalone); True Cost (Stock) = (Alpha × Combined Value) - PV(Target).',
              ],
            },
          ],
        },
      ],
    },
  ],

  'indirect-taxes': [
    {
      chapterNumber: 1,
      chapterKey: 'gst-itc',
      chapterTitle: 'Input Tax Credit, Blocked Credits & Apportionment',
      standards: ['Sec 16', 'Sec 17(5)', 'Rule 42'],
      artifacts: [
        {
          id: 'idt-itc-mod',
          title: 'GST Input Tax Credit (Sec 16–18) Study Module',
          fileName: 'Ch 01 - GST Input Tax Credit Sec 16 to 18 Module.pdf',
          category: 'module',
          format: 'pdf',
          standards: ['Sec 16', 'Sec 17(5)', 'Rule 42'],
          mimeType: 'application/pdf',
          sizeLabel: '12.6 MB',
          modifiedAt: '2026-11-05',
          folderPath: ['Modules'],
          previewSlides: [
            {
              heading: 'Conditions for Availing ITC (Sec 16(2))',
              standardRef: 'CGST Act · Sec 16(2)',
              keyPoints: [
                'Possession of tax invoice / debit note + details furnished by supplier in GSTR-1 and communicated to recipient in GSTR-2B.',
                'Goods or services actually received (includes Bill-to-Ship-to constructive receipt).',
                'Tax charged has been actually paid to Government & recipient has furnished GSTR-3B.',
                'Time limit to claim ITC: 30th November following end of financial year or filing of Annual Return, whichever is earlier.',
              ],
            },
          ],
        },
        {
          id: 'idt-itc-info',
          title: 'Sec 17(5) Blocked Credits & Rule 42/43 Flow Chart',
          fileName: 'GST Sec 17(5) Blocked Credits Infographic.png',
          category: 'infographic',
          format: 'image',
          standards: ['Sec 17(5)', 'Rule 42'],
          mimeType: 'image/png',
          sizeLabel: '1.8 MB',
          modifiedAt: '2026-11-12',
          folderPath: ['Revision Slides & Infographics', 'Input Tax Credit'],
          previewDiagram: 'gst-itc-flow',
        },
      ],
    },
  ],

  'direct-taxes': [
    {
      chapterNumber: 1,
      chapterKey: 'pgbp-icds',
      chapterTitle: 'Profits & Gains of Business or Profession (PGBP) & ICDS',
      standards: ['Sec 28', 'Sec 43B', 'ICDS I–X'],
      artifacts: [
        {
          id: 'dt-pgbp-mod',
          title: 'PGBP Deductions, Disallowances & Sec 43B Module',
          fileName: 'Ch 01 - PGBP and Sec 43B Disallowances Module.pdf',
          category: 'module',
          format: 'pdf',
          standards: ['Sec 28', 'Sec 43B', 'ICDS I–X'],
          mimeType: 'application/pdf',
          sizeLabel: '18.5 MB',
          modifiedAt: '2026-11-03',
          folderPath: ['Modules'],
          previewSlides: [
            {
              heading: 'Section 43B(h): Payments to Micro & Small Enterprises',
              standardRef: 'Income-tax Act · Sec 43B(h)',
              keyPoints: [
                'Any sum payable by the assessee to a Micro or Small enterprise beyond the time limit specified in Section 15 of MSMED Act (15 days without agreement, max 45 days with written agreement) is allowed ONLY on actual payment basis.',
                'Proviso allowing deduction if paid before Sec 139(1) ROI due date does NOT apply to clause (h) payments.',
                'Verify supplier Udyam registration category (Micro/Small vs Medium) before applying Sec 43B(h).',
              ],
            },
          ],
        },
      ],
    },
  ],
};

export function buildSeedCatalogs(): SubjectCatalog[] {
  return SUBJECT_CONFIGS.map((config) => {
    const blueprints = SEED_BLUEPRINTS[config.id] ?? [];
    const chapters: ChapterGroup[] = blueprints.map((bp) => {
      const artifacts: StudyArtifact[] = bp.artifacts.map((art) => ({
        ...art,
        subjectId: config.id,
        chapterKey: bp.chapterKey,
        chapterTitle: bp.chapterTitle,
      }));
      const modules = artifacts.filter((a) => a.category === 'module');
      const revisions = artifacts.filter((a) => a.category !== 'module');

      return {
        chapterKey: bp.chapterKey,
        chapterNumber: bp.chapterNumber,
        chapterTitle: bp.chapterTitle,
        subjectId: config.id,
        standards: bp.standards,
        modules,
        revisions,
        allArtifacts: artifacts,
      };
    });

    const totalModules = chapters.reduce((sum, ch) => sum + ch.modules.length, 0);
    const totalRevisions = chapters.reduce((sum, ch) => sum + ch.revisions.length, 0);

    return {
      config,
      chapters,
      totalModules,
      totalRevisions,
      source: 'preview-catalog',
    };
  });
}
