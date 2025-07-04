
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
  lastVisitDate: string;
  expirationDate: string;
  visitFrequency: number;
  isBirthday: boolean;
  loginCount: number;
  lastLogin: string;
}

export interface Reward {
  id: string;
  name: string;
  type: 'Voucher' | 'Product' | 'Seasonal';
  pointsCost: number;
  imageUrl: string;
  stock: number;
}

export interface Promotion {
  id:string;
  name: string;
  description: string;
  type: 'Discount' | 'Double Points' | 'Gift';
  startDate: string;
  endDate: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrls: string[];
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

export interface Event {
    id: string;
    name: string;
    description: string;
    date: string;
    location: string;
    targetTiers: Tier[];
}

export interface TierRule {
    colorClass: string;
    hex: string;
    nextRetail: number;
    nextWholesale: number;
    benefits: string[];
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    sentDate: string;
    targetTiers: Tier[] | 'all';
}

export interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  memberTier: Tier;
  amount: number;
  date: string;
  status: 'Success' | 'Failed';
  description: string;
}

export interface ContentUsage {
  id: string;
  name: string;
  type: 'Video' | 'Article' | 'Promotion';
  views: number;
}

export type Language = 'en' | 'my';

export type Page = 'login' | 'dashboard' | 'members' | 'rewards' | 'member-view' | 'promotions' | 'analytics' | 'events' | 'tier-rules' | 'notifications' | 'ecommerce-admin' | 'member-reports' | 'financial-reports' | 'engagement-reports';