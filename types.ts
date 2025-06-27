
export enum Tier {
  Normal = 'Normal',
  Gold = 'Gold',
  Platinum = 'Platinum',
  Diamond = 'Diamond'
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  nrc: string;
  address: string;
  tier: Tier;
  points: number;
  retailSpend: number;
  wholesaleSpend: number;
  joinDate: string;
  visitFrequency: number;
  isBirthday: boolean;
}

export interface Reward {
  id: string;
  name: string;
  type: 'Voucher' | 'Product' | 'Seasonal';
  pointsCost: number;
  imageUrl: string;
  stock: number;
}

export interface SalesData {
  month: string;
  sales: number;
  redemptions: number;
}

export interface DashboardData {
  totalMembers: number;
  activePromotions: number;
  totalPointsRedeemed: number;
  tierDistribution: { name: Tier; value: number }[];
  salesVsRedemption: SalesData[];
  mostRedeemedItems: { name: string; count: number }[];
  pointsUsageTrends: { date: string; points: number }[];
}

export type Language = 'en' | 'my';

export type Page = 'login' | 'dashboard' | 'members' | 'rewards' | 'member-view';
