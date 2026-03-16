import type { Report } from '@/frameworks/types';

const STORAGE_KEY = 'bizscope_reports';

export function getReports(): Report[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Report[];
  } catch {
    return [];
  }
}

export function getReport(id: string): Report | null {
  return getReports().find((r) => r.id === id) ?? null;
}

export function saveReport(report: Report): void {
  try {
    const reports = getReports();
    const idx = reports.findIndex((r) => r.id === report.id);
    if (idx >= 0) {
      reports[idx] = report;
    } else {
      reports.unshift(report);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function deleteReport(id: string): void {
  try {
    const reports = getReports().filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch {
    // localStorage unavailable — silently fail
  }
}
