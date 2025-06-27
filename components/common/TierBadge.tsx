import React from 'react';
import { Tier } from '../../types';
import { TIER_DATA } from '../../constants';

interface TierBadgeProps {
  tier: Tier;
}

const TierBadge: React.FC<TierBadgeProps> = ({ tier }) => {
  const tierInfo = TIER_DATA[tier];
  if (!tierInfo) return null;

  return (
    <span className={`px-2 py-1 text-xs font-bold rounded-full text-white ${tierInfo.colorClass}`}>
      {tier}
    </span>
  );
};

export default TierBadge;