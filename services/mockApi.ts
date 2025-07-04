
import { MOCK_MEMBERS, MOCK_REWARDS, MOCK_DASHBOARD_DATA, MOCK_PROMOTIONS, TIER_DATA, MOCK_EVENTS, MOCK_NOTIFICATIONS, MOCK_PRODUCTS, MOCK_TRANSACTIONS, MOCK_CONTENT_USAGE } from '../constants';
import { Member, Reward, DashboardData, Promotion, Tier, TierRule, Event, Notification, Product, Transaction, ContentUsage } from '../types';

const simulateDelay = <T,>(data: T, delay: number = 500): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), delay));
};

export const getMembers = (): Promise<Member[]> => {
  return simulateDelay(MOCK_MEMBERS);
};

export const getRewards = (): Promise<Reward[]> => {
  return simulateDelay(MOCK_REWARDS);
};

export const getDashboardData = (): Promise<DashboardData> => {
    return simulateDelay(MOCK_DASHBOARD_DATA);
}

export const getMemberById = (id: string): Promise<Member | undefined> => {
    const member = MOCK_MEMBERS.find(m => m.id === id);
    return simulateDelay(member);
}

export const getPromotions = (): Promise<Promotion[]> => {
    return simulateDelay(MOCK_PROMOTIONS);
};

export const getEvents = (): Promise<Event[]> => {
    return simulateDelay(MOCK_EVENTS);
}

export const getTierRules = (): Promise<Record<Tier, TierRule>> => {
    return simulateDelay(TIER_DATA);
}

export const getNotifications = (): Promise<Notification[]> => {
    return simulateDelay(MOCK_NOTIFICATIONS);
}

export const getProducts = (): Promise<Product[]> => {
    return simulateDelay(MOCK_PRODUCTS);
};

export const getTransactions = (): Promise<Transaction[]> => {
    return simulateDelay(MOCK_TRANSACTIONS);
};

export const getContentUsage = (): Promise<ContentUsage[]> => {
    return simulateDelay(MOCK_CONTENT_USAGE);
};