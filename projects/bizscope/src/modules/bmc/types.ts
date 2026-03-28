export const BMC_BLOCKS = [
  'customer-segments', 'value-proposition', 'channels', 'customer-relationships',
  'revenue-streams', 'key-resources', 'key-activities', 'key-partners', 'cost-structure',
] as const;

export type BmcBlock = (typeof BMC_BLOCKS)[number];

export interface BmcBlockData {
  entries: string[];
  notes?: string;
  aiGenerated?: boolean;
  [key: string]: unknown;
}

export interface BmcData {
  id: string;
  title: string;
  blocks: Partial<Record<BmcBlock, BmcBlockData>>;
  status: 'draft' | 'complete';
  createdAt: number;
  updatedAt: number;
}

export interface BmcBlockMeta {
  block: BmcBlock;
  label: string;
  labelKo: string;
  description: string;
  guideQuestions: string[];
}
