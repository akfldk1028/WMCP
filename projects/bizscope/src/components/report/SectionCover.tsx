import {
  Building2, Globe, Grid3X3, Shield, LayoutGrid,
  Layers, Combine, Hexagon, Rocket, GitCompare,
  Users, Flag,
} from 'lucide-react';
import type { SectionType } from '@/frameworks/types';
import { SECTION_DESCRIPTIONS } from '@/lib/pages';

interface Props {
  sectionIndex: number;
  sectionType: SectionType;
  sectionTitle: string;
  companyName: string;
}

const SECTION_ICONS: Record<SectionType, typeof Building2> = {
  'company-overview': Building2,
  'pest-analysis': Globe,
  'possibility-impact-matrix': Grid3X3,
  'internal-capability': Shield,
  'swot-summary': LayoutGrid,
  'tows-cross-matrix': Layers,
  'strategy-combination': Combine,
  'seven-s-alignment': Hexagon,
  'priority-matrix': Rocket,
  'strategy-current-comparison': GitCompare,
  'competitor-comparison': Users,
  'final-implications': Flag,
};

const GRADIENTS: string[] = [
  'from-indigo-600 via-violet-600 to-purple-700',
  'from-blue-600 via-cyan-600 to-teal-600',
  'from-emerald-600 via-green-600 to-lime-600',
  'from-violet-600 via-purple-600 to-fuchsia-600',
  'from-amber-600 via-orange-600 to-red-600',
  'from-sky-600 via-blue-600 to-indigo-600',
  'from-teal-600 via-emerald-600 to-green-600',
  'from-purple-600 via-pink-600 to-rose-600',
  'from-cyan-600 via-sky-600 to-blue-600',
  'from-rose-600 via-red-600 to-orange-600',
  'from-indigo-600 via-blue-600 to-cyan-600',
  'from-violet-600 via-indigo-600 to-blue-600',
];

export default function SectionCover({ sectionIndex, sectionType, sectionTitle, companyName }: Props) {
  const Icon = SECTION_ICONS[sectionType];
  const gradient = GRADIENTS[sectionIndex % GRADIENTS.length];
  const description = SECTION_DESCRIPTIONS[sectionType];

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-8 py-16 text-center">
      {/* Section number */}
      <div className={`mb-8 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-2xl`}>
        <Icon className="size-10 text-white" />
      </div>

      {/* Section number text */}
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">
        Section {String(sectionIndex + 1).padStart(2, '0')}
      </p>

      {/* Title */}
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight md:text-4xl">
        {sectionTitle}
      </h1>

      {/* Description */}
      <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
        {description}
      </p>

      {/* Divider */}
      <div className={`mt-8 h-1 w-24 rounded-full bg-gradient-to-r ${gradient}`} />

      {/* Company name */}
      <p className="mt-6 text-sm font-medium text-muted-foreground">
        {companyName}
      </p>
    </div>
  );
}
