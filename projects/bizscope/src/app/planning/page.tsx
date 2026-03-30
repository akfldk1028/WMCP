'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, LayoutGrid, FileText, Layers, CheckCircle2 } from 'lucide-react';
import { PlanningChat } from '@/modules/planning-chat';
import type { PlanningChatConfig } from '@/modules/planning-chat';
import { useLocale } from '@/i18n';
import { BMC_BLOCK_META } from '@/modules/bmc/prompts';
import { PLAN_STAGE_META } from '@/modules/service-planning/prompts';
import type { BmcBlock, BmcBlockData } from '@/modules/bmc/types';
import type { PlanStage, StageData } from '@/modules/service-planning/types';

type ChatMode = 'bmc' | 'service-planning' | 'both';

const MODE_ICONS: Record<ChatMode, typeof LayoutGrid> = {
  bmc: LayoutGrid,
  'service-planning': FileText,
  both: Layers,
};

const MODE_KEYS: ChatMode[] = ['bmc', 'service-planning', 'both'];

/* BMC classic grid order (top→bottom, left→right) */
const BMC_GRID: { block: BmcBlock; area: string }[] = [
  { block: 'key-partners', area: 'kp' },
  { block: 'key-activities', area: 'ka' },
  { block: 'value-proposition', area: 'vp' },
  { block: 'customer-relationships', area: 'cr' },
  { block: 'customer-segments', area: 'cs' },
  { block: 'key-resources', area: 'kr' },
  { block: 'channels', area: 'ch' },
  { block: 'cost-structure', area: 'co' },
  { block: 'revenue-streams', area: 'rs' },
];

function CanvasPanel({ activeTab, onTabChange, labels, bmcBlocks, planStages }: { activeTab: 'bmc' | 'plan'; onTabChange: (t: 'bmc' | 'plan') => void; labels: { bmc: string; plan: string; empty: string }; bmcBlocks: Partial<Record<BmcBlock, BmcBlockData>>; planStages: Partial<Record<PlanStage, StageData>> }) {
  return (
    <div className="flex h-full flex-col" style={{ background: '#1c1b1d' }}>
      {/* Tab bar */}
      <div className="flex gap-1 px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={() => onTabChange('bmc')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            activeTab === 'bmc'
              ? 'text-[#e1e0ff]' : 'text-[#908fa0] hover:text-[#c7c4d7]'
          }`}
          style={activeTab === 'bmc' ? { background: '#2a2a2c' } : {}}
        >
          {labels.bmc}
        </button>
        <button
          type="button"
          onClick={() => onTabChange('plan')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            activeTab === 'plan'
              ? 'text-[#e1e0ff]' : 'text-[#908fa0] hover:text-[#c7c4d7]'
          }`}
          style={activeTab === 'plan' ? { background: '#2a2a2c' } : {}}
        >
          {labels.plan}
        </button>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        {activeTab === 'bmc' ? <BmcCanvasGrid emptyLabel={labels.empty} bmcBlocks={bmcBlocks} /> : <PlanStageList planStages={planStages} />}
      </div>
    </div>
  );
}

function BmcCanvasGrid({ emptyLabel, bmcBlocks }: { emptyLabel: string; bmcBlocks: Partial<Record<BmcBlock, BmcBlockData>> }) {
  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: 'repeat(5, 1fr)',
        gridTemplateRows: 'auto auto auto',
        gridTemplateAreas: `
          "kp ka vp cr cs"
          "kp kr vp ch cs"
          "co co rs rs rs"
        `,
      }}
    >
      {BMC_GRID.map(({ block, area }) => {
        const meta = BMC_BLOCK_META[block];
        const data = bmcBlocks[block];
        const filled = data && data.entries.length > 0;
        return (
          <div
            key={block}
            className={`rounded-xl p-3 transition hover:brightness-110 ${filled ? 'border border-indigo-500/30' : ''}`}
            style={{ gridArea: area, background: filled ? 'rgba(99,102,241,0.08)' : '#2a2a2c', minHeight: 80 }}
          >
            <div className="flex items-center gap-1">
              {filled && <CheckCircle2 className="size-2.5 text-indigo-400" />}
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#908fa0]">
                {meta.labelKo}
              </p>
            </div>
            {filled ? (
              <ul className="mt-1.5 space-y-0.5">
                {data.entries.slice(0, 4).map((entry, i) => (
                  <li key={i} className="text-[10px] leading-snug text-[#e5e1e4]">• {entry.slice(0, 50)}</li>
                ))}
                {data.entries.length > 4 && (
                  <li className="text-[10px] text-[#908fa0]">+{data.entries.length - 4}건</li>
                )}
              </ul>
            ) : (
              <p className="mt-1 text-[10px] text-[#464554]">{emptyLabel}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PlanStageList({ planStages }: { planStages: Partial<Record<PlanStage, StageData>> }) {
  const stages = Object.entries(PLAN_STAGE_META) as [PlanStage, typeof PLAN_STAGE_META[PlanStage]][];
  return (
    <div className="space-y-2">
      {stages.map(([stage, meta]) => {
        const data = planStages[stage];
        const filled = !!data;
        const content = filled ? String(data.sections.content ?? '') : '';
        const lines = content.split('\n').filter(Boolean);
        return (
          <div
            key={stage}
            className={`rounded-xl p-3 transition hover:brightness-110 ${filled ? 'border border-indigo-500/30' : ''}`}
            style={{ background: filled ? 'rgba(99,102,241,0.08)' : '#2a2a2c' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {filled && <CheckCircle2 className="size-2.5 text-indigo-400" />}
                <p className="text-xs font-medium text-[#e5e1e4]">{meta.labelKo}</p>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[10px] text-[#908fa0]" style={{ background: '#353437' }}>
                {filled ? `${meta.subsections.length}/${meta.subsections.length}` : `0/${meta.subsections.length}`}
              </span>
            </div>
            {filled ? (
              <ul className="mt-1.5 space-y-0.5">
                {lines.slice(0, 3).map((line, i) => (
                  <li key={i} className="text-[10px] leading-snug text-[#e5e1e4]">• {line.slice(0, 60)}</li>
                ))}
                {lines.length > 3 && (
                  <li className="text-[10px] text-[#908fa0]">+{lines.length - 3}건</li>
                )}
              </ul>
            ) : (
              <p className="mt-1 text-[10px] text-[#908fa0]">{meta.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PlanningPage() {
  const [mode, setMode] = useState<ChatMode>('both');
  const [canvasTab, setCanvasTab] = useState<'bmc' | 'plan'>('bmc');
  const [bmcBlocks, setBmcBlocks] = useState<Partial<Record<BmcBlock, BmcBlockData>>>({});
  const [planStages, setPlanStages] = useState<Partial<Record<PlanStage, StageData>>>({});
  const { t } = useLocale();
  const p = t.ui.planning;

  const handleEvent = useCallback((event: { type: string; data: Record<string, unknown> }) => {
    if (event.type === 'data-update') {
      if (event.data.bmcBlocks) setBmcBlocks(event.data.bmcBlocks as Partial<Record<BmcBlock, BmcBlockData>>);
      if (event.data.planStages) setPlanStages(event.data.planStages as Partial<Record<PlanStage, StageData>>);
    }
  }, []);

  const modeLabels: Record<ChatMode, string> = {
    bmc: p.modeBmc,
    'service-planning': p.modeServicePlan,
    both: p.modeBoth,
  };

  const config: PlanningChatConfig = {
    apiEndpoint: '/api/planning/chat',
    mode,
  };

  return (
    <div className="flex h-dvh flex-col" style={{ background: '#131315', color: '#e5e1e4' }}>
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between px-4 py-3" style={{ background: '#201f22' }}>
        <Link
          href="/"
          className="flex items-center gap-2 text-sm transition hover:opacity-80"
        >
          <ArrowLeft className="size-4 text-[#908fa0]" />
          <span className="font-semibold">BizScope AI</span>
          <span className="text-[#908fa0]">/ {p.title}</span>
        </Link>

        {/* Mode selector */}
        <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: '#2a2a2c' }}>
          {MODE_KEYS.map((m) => {
            const Icon = MODE_ICONS[m];
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition"
                style={active
                  ? { background: '#8083ff', color: '#fff', boxShadow: '0 0 10px rgba(128,131,255,0.3)' }
                  : { color: '#908fa0' }
                }
              >
                <Icon className="size-3.5" />
                {modeLabels[m]}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main: Chat + Canvas split */}
      <div className="flex min-h-0 flex-1">
        {/* Chat panel — 60% */}
        <div className="flex w-3/5 flex-col" style={{ background: '#131315' }}>
          <PlanningChat config={config} onEvent={handleEvent} />
        </div>

        {/* Canvas panel — 40% */}
        <div className="w-2/5" style={{ borderLeft: '1px solid #2a2a2c' }}>
          <CanvasPanel activeTab={canvasTab} onTabChange={setCanvasTab} labels={{ bmc: p.canvasTabBmc, plan: p.canvasTabPlan, empty: p.entriesEmpty }} bmcBlocks={bmcBlocks} planStages={planStages} />
        </div>
      </div>
    </div>
  );
}
