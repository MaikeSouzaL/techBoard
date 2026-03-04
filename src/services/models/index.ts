import api from '../index';
import { DeviceModel } from '@/lib/types';

const mapModel = (m: DeviceModel & { _id: string }): DeviceModel => ({ ...m, id: m._id });

export const modelService = {
  getAll: async (brandId?: string): Promise<DeviceModel[]> => {
    const { data } = await api.get('/models', { params: { brandId } });
    return data.map(mapModel);
  },

  getById: async (id: string): Promise<DeviceModel> => {
    const { data } = await api.get(`/models/${id}`);
    return mapModel(data);
  },

  create: async (payload: Partial<DeviceModel>): Promise<DeviceModel> => {
    const { data } = await api.post('/models', payload);
    return mapModel(data);
  },

  update: async (id: string, payload: Partial<DeviceModel>): Promise<DeviceModel> => {
    const { data } = await api.put(`/models/${id}`, payload);
    return mapModel(data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/models/${id}`);
  }
};
