import { BMC_BLOCKS, type BmcBlock, type BmcData } from './types';

export interface BmcValidationResult {
  valid: boolean;
  missingBlocks: BmcBlock[];
  emptyBlocks: BmcBlock[];
}

export function validateBmc(bmc: BmcData): BmcValidationResult {
  const missingBlocks: BmcBlock[] = [];
  const emptyBlocks: BmcBlock[] = [];
  for (const block of BMC_BLOCKS) {
    const data = bmc.blocks[block];
    if (!data) { missingBlocks.push(block); }
    else if (data.entries.length === 0) { emptyBlocks.push(block); }
  }
  return { valid: missingBlocks.length === 0 && emptyBlocks.length === 0, missingBlocks, emptyBlocks };
}

export function getCompletionPercentage(bmc: BmcData): number {
  let filled = 0;
  for (const block of BMC_BLOCKS) {
    const data = bmc.blocks[block];
    if (data && data.entries.length > 0) filled++;
  }
  return (filled / BMC_BLOCKS.length) * 100;
}
