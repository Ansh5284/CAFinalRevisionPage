import { useState } from 'react';
import accountingCycleImg from '../assets/images/infographic_ind_as_115_1795448660364.jpg';
import type { PreviewDiagramKey } from '../types/archive';

interface InfographicPlateProps {
  diagram: PreviewDiagramKey;
  title: string;
}

export function InfographicPlate({ diagram, title }: InfographicPlateProps) {
  const [imgFailed, setImgFailed] = useState(false);

  if (diagram === 'accounting-cycle-image' && !imgFailed) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6">
        <img
          src={accountingCycleImg}
          alt={title}
          referrerPolicy="no-referrer"
          draggable={false}
          onError={() => setImgFailed(true)}
          className="w-full h-auto rounded-lg select-none pointer-events-none"
        />
        <p className="mt-3 text-xs text-slate-500 text-center">
          Protected visual revision chart · Right-click and download disabled
        </p>
      </div>
    );
  }

  if (diagram === 'ind-as-115-five-step') {
    const steps = [
      {
        num: '01',
        title: 'Identify Contract',
        note: 'Commercial substance, approved rights & probable collection',
      },
      {
        num: '02',
        title: 'Performance Obligations',
        note: 'Capable of being distinct + distinct within contract context',
      },
      {
        num: '03',
        title: 'Transaction Price',
        note: 'Fixed + constrained variable consideration & financing component',
      },
      {
        num: '04',
        title: 'Allocate Price',
        note: 'Proportional to Standalone Selling Prices (SSP)',
      },
      {
        num: '05',
        title: 'Recognize Revenue',
        note: 'Over time (3 criteria) or Point in time upon control transfer',
      },
    ];

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <p className="font-mono text-xs text-blue-700">Ind AS 115 · Revision Infographic</p>
          <h3 className="font-display text-xl font-semibold text-slate-900 mt-1">
            Five-Step Revenue Recognition & Contract Modification Decision Flow
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {steps.map((step) => (
            <div
              key={step.num}
              className="border border-slate-200 rounded-lg p-4 bg-[#F8F9FA] flex flex-col justify-between"
            >
              <div>
                <p className="font-mono text-xs font-medium text-blue-700 tabular-nums">
                  Step {step.num}
                </p>
                <p className="font-semibold text-sm text-slate-900 mt-1">{step.title}</p>
              </div>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">{step.note}</p>
            </div>
          ))}
        </div>

        <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
          <p className="text-xs font-semibold text-slate-900 mb-3">
            Contract Modification Matrix (Para 20–21)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white border border-slate-200 rounded-lg p-3.5">
              <p className="font-semibold text-slate-900">Distinct + Price = SSP</p>
              <p className="text-slate-600 mt-1">
                Account as a <span className="font-semibold text-blue-700">Separate Contract</span>. No change to existing contract.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3.5">
              <p className="font-semibold text-slate-900">Distinct + Price != SSP</p>
              <p className="text-slate-600 mt-1">
                <span className="font-semibold text-blue-700">Prospective</span>: terminate old contract & blend remaining consideration.
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3.5">
              <p className="font-semibold text-slate-900">Not Distinct Goods/Services</p>
              <p className="text-slate-600 mt-1">
                <span className="font-semibold text-blue-700">Cumulative Catch-up</span> adjustment to revenue at modification date.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (diagram === 'audit-risk-model') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <p className="font-mono text-xs text-blue-700">SA 315 & SA 330 · Visual Chart</p>
          <h3 className="font-display text-xl font-semibold text-slate-900 mt-1">
            Audit Risk Model & Response Strategy
          </h3>
        </div>

        <div className="border border-slate-200 rounded-lg p-4 bg-[#F8F9FA] text-center font-mono text-sm text-slate-900">
          Audit Risk (AR) = Inherent Risk (IR) × Control Risk (CR) × Detection Risk (DR)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="border border-slate-200 rounded-lg p-4">
            <p className="font-mono text-xs text-slate-500">Entity-Level Risk</p>
            <p className="font-semibold text-slate-900 mt-1">Inherent Risk (IR)</p>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Susceptibility of an assertion to material misstatement before considering related controls. Driven by estimation complexity and fraud pressure.
            </p>
          </div>
          <div className="border border-slate-200 rounded-lg p-4">
            <p className="font-mono text-xs text-slate-500">Internal Control Risk</p>
            <p className="font-semibold text-slate-900 mt-1">Control Risk (CR)</p>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Risk that entity controls fail to prevent, or detect and correct, a misstatement timely. Test operating effectiveness under SA 330.
            </p>
          </div>
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/40">
            <p className="font-mono text-xs text-blue-700">Auditor-Controlled Variable</p>
            <p className="font-semibold text-slate-900 mt-1">Detection Risk (DR)</p>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              Inversely related to assessed RoMM (IR × CR). Higher RoMM mandates lower acceptable DR via stronger Nature, Timing & Extent of substantive tests.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (diagram === 'forex-hedging-tree') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <p className="font-mono text-xs text-blue-700">AFM · Foreign Exchange Hedging Chart</p>
          <h3 className="font-display text-xl font-semibold text-slate-900 mt-1">
            Exporter vs Importer Currency Hedge Selection Matrix
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="border border-slate-200 rounded-lg p-5 space-y-2.5">
            <p className="text-sm font-semibold text-slate-900">Foreign Currency Receivable (Exporter)</p>
            <p className="text-slate-600">Risk: Foreign currency depreciates before receipt.</p>
            <ul className="space-y-1.5 text-slate-700 list-disc pl-4">
              <li>Forward Cover: Sell foreign currency forward at Bank Bid rate.</li>
              <li>Money Market Hedge: Borrow PV in FC → Convert at Spot Bid → Invest Home Currency.</li>
              <li>Currency Options: Buy Put Option (downside floor + unlimited upside).</li>
            </ul>
          </div>
          <div className="border border-slate-200 rounded-lg p-5 space-y-2.5">
            <p className="text-sm font-semibold text-slate-900">Foreign Currency Payable (Importer)</p>
            <p className="text-slate-600">Risk: Foreign currency appreciates before settlement.</p>
            <ul className="space-y-1.5 text-slate-700 list-disc pl-4">
              <li>Forward Cover: Buy foreign currency forward at Bank Ask rate.</li>
              <li>Money Market Hedge: Borrow Home Currency → Convert at Spot Ask → Deposit PV in FC.</li>
              <li>Currency Options: Buy Call Option (caps maximum outflow; retain benefit if FC falls).</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <p className="font-mono text-xs text-blue-700">CGST Act · Sec 16 & Sec 17(5) Flow</p>
        <h3 className="font-display text-xl font-semibold text-slate-900 mt-1">
          Input Tax Credit Eligibility & Blocked Credit Filter
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="border border-slate-200 rounded-lg p-4">
          <p className="font-semibold text-slate-900">1. Sec 16(2) Gatekeepers</p>
          <p className="text-slate-600 mt-2 leading-relaxed">
            Tax invoice + reflected in GSTR-2B + goods/services received + supplier tax paid + GSTR-3B filed within Sec 16(4) cut-off (30 Nov).
          </p>
        </div>
        <div className="border border-slate-200 rounded-lg p-4">
          <p className="font-semibold text-slate-900">2. Sec 17(5) Blocked List</p>
          <p className="text-slate-600 mt-2 leading-relaxed">
            Motor vehicles (&le;13 persons unless specified use), food/beverages/club membership, works contract for immovable property (except plant & machinery), CSR goods.
          </p>
        </div>
        <div className="border border-slate-200 rounded-lg p-4">
          <p className="font-semibold text-slate-900">3. Rule 42 & Rule 43</p>
          <p className="text-slate-600 mt-2 leading-relaxed">
            Apportion common credit between taxable + zero-rated supplies vs exempt supplies; reverse ineligible proportion monthly & reconcile annually.
          </p>
        </div>
      </div>
    </div>
  );
}
