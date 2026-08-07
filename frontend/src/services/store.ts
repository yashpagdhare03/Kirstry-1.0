import { api } from './api';

export interface StoreDetails {
  id?: string;
  store_id: string;
  name: string;
  address?: string;
  gstin?: string;
  phone?: string;
  created_at: string;
}

export interface StoreMember {
  id: string;
  store_id: string;
  email: string;
  name?: string;
  role: 'owner' | 'staff' | string;
  status: 'active' | 'invited' | string;
  joined_at: string;
}

export interface UpdateStorePayload {
  name?: string;
  address?: string;
  gstin?: string;
  phone?: string;
}

export interface InviteMemberPayload {
  email: string;
  name?: string;
  role?: string;
}

export const storeService = {
  async getStoreDetails() {
    return api.get<StoreDetails>('/store');
  },

  async updateStoreDetails(payload: UpdateStorePayload) {
    return api.put<StoreDetails>('/store', payload);
  },

  async getStoreMembers() {
    return api.get<{ members: StoreMember[] }>('/store/members');
  },

  async inviteMember(payload: InviteMemberPayload) {
    return api.post<StoreMember>('/store/members/invite', payload);
  },

  async removeMember(memberId: string) {
    return api.delete<{ id: string }>(`/store/members/${memberId}`);
  },
};
