import { createStore } from 'zustand/vanilla';
import type { BmcBlock, BmcBlockData, BmcData } from '@/modules/bmc/types';
import type { PlanStage, StageData, ServicePlanData } from '@/modules/service-planning/types';

interface PlanningState {
  bmc: BmcData;
  servicePlan: ServicePlanData;
  updateBmcBlock: (block: BmcBlock, data: BmcBlockData) => void;
  updateStage: (stage: PlanStage, data: StageData) => void;
  setTitle: (title: string) => void;
  reset: () => void;
}

function createEmptyBmc(): BmcData {
  const now = Date.now();
  return { id: `bmc-${now}`, title: '', blocks: {}, status: 'draft', createdAt: now, updatedAt: now };
}

function createEmptyPlan(): ServicePlanData {
  const now = Date.now();
  return { id: `plan-${now}`, title: '', stages: {}, status: 'draft', createdAt: now, updatedAt: now };
}

export function createPlanningStore() {
  return createStore<PlanningState>((set) => ({
    bmc: createEmptyBmc(),
    servicePlan: createEmptyPlan(),

    updateBmcBlock: (block, data) =>
      set((state) => ({
        bmc: {
          ...state.bmc,
          blocks: { ...state.bmc.blocks, [block]: data },
          updatedAt: Date.now(),
        },
      })),

    updateStage: (stage, data) =>
      set((state) => ({
        servicePlan: {
          ...state.servicePlan,
          stages: { ...state.servicePlan.stages, [stage]: data },
          updatedAt: Date.now(),
        },
      })),

    setTitle: (title) =>
      set((state) => ({
        bmc: { ...state.bmc, title },
        servicePlan: { ...state.servicePlan, title },
      })),

    reset: () => set({ bmc: createEmptyBmc(), servicePlan: createEmptyPlan() }),
  }));
}
