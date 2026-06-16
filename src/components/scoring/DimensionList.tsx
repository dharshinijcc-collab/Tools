'use client';

import { ScoringResponse } from '@/types/scoring';
import { DIMENSION_META, DimensionKey } from '@/types/scoring';
import DimensionCard from './DimensionCard';

interface DimensionListProps {
  dimensions: ScoringResponse['dimensions'];
  unlocked: boolean;
}

export default function DimensionList({ dimensions, unlocked }: DimensionListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {DIMENSION_META.map((meta, i) => {
        const detail = dimensions[meta.key as DimensionKey];
        return (
          <DimensionCard
            key={meta.key}
            label={meta.label}
            icon={meta.icon}
            weight={meta.weight}
            detail={detail}
            unlocked={unlocked}
            index={i}
          />
        );
      })}
    </div>
  );
}
