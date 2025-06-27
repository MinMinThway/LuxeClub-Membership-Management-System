
import { MOCK_MEMBERS, MOCK_REWARDS, MOCK_DASHBOARD_DATA } from '../constants';
import { Member, Reward, DashboardData } from '../types';

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
