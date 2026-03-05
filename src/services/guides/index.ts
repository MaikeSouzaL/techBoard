import api from '../index';
import { RepairGuide } from '@/lib/types';

const mapGuide = (g: RepairGuide & { _id: string }): RepairGuide => ({ ...g, id: g._id });

export const guideService = {
  getAll: async (modelId?: string): Promise<RepairGuide[]> => {
    const { data } = await api.get('/guides', { params: { modelId } });
    return data.map(mapGuide);
  },

  getById: async (id: string): Promise<RepairGuide> => {
    const { data } = await api.get(`/guides/${id}`);
    return mapGuide(data);
  },

  create: async (payload: Partial<RepairGuide>): Promise<RepairGuide> => {
    const { data } = await api.post('/guides', payload);
    return mapGuide(data);
  },

  update: async (id: string, payload: Partial<RepairGuide>): Promise<RepairGuide> => {
    const { data } = await api.put(`/guides/${id}`, payload);
    return mapGuide(data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/guides/${id}`);
  }
};
