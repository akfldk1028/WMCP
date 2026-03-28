import type { BmcData } from '@/modules/bmc/types';
import type { ServicePlanData } from '@/modules/service-planning/types';

const LOCAL_PREFIX = 'bsai_plan_';
const LOCAL_INDEX_KEY = 'bsai_plan_index';
const MAX_LOCAL_PLANS = 3;

interface StoredPlan {
  bmc: BmcData;
  servicePlan: ServicePlanData;
  savedAt: number;
}

/** Save planning data to localStorage (Free tier) */
export function savePlanLocal(planId: string, bmc: BmcData, servicePlan: ServicePlanData): void {
  const stored: StoredPlan = { bmc, servicePlan, savedAt: Date.now() };
  localStorage.setItem(`${LOCAL_PREFIX}${planId}`, JSON.stringify(stored));

  // Update index
  const index = getLocalIndex();
  if (!index.includes(planId)) {
    index.push(planId);
  }

  // Enforce max limit
  while (index.length > MAX_LOCAL_PLANS) {
    const oldest = index.shift()!;
    localStorage.removeItem(`${LOCAL_PREFIX}${oldest}`);
  }

  localStorage.setItem(LOCAL_INDEX_KEY, JSON.stringify(index));
}

/** Load planning data from localStorage */
export function loadPlanLocal(planId: string): StoredPlan | null {
  const raw = localStorage.getItem(`${LOCAL_PREFIX}${planId}`);
  if (!raw) return null;
  return JSON.parse(raw) as StoredPlan;
}

/** List all saved plan IDs from localStorage */
export function listPlansLocal(): string[] {
  return getLocalIndex();
}

function getLocalIndex(): string[] {
  const raw = localStorage.getItem(LOCAL_INDEX_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as string[];
}
