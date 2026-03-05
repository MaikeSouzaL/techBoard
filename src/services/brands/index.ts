import api from '../index';
import { Brand } from '@/lib/types';

// Map MongoDB _id to frontend id
const mapBrand = (b: Brand & { _id: string }): Brand => ({ ...b, id: b._id });

export const brandService = {
  getAll: async (): Promise<Brand[]> => {
    const { data } = await api.get('/brands');
    return data.map(mapBrand);
  },
  
  getById: async (id: string): Promise<Brand> => {
    const { data } = await api.get(`/brands/${id}`);
    return mapBrand(data);
  },

  create: async (payload: Partial<Brand>): Promise<Brand> => {
    const { data } = await api.post('/brands', payload);
    return mapBrand(data);
  },

  update: async (id: string, payload: Partial<Brand>): Promise<Brand> => {
    const { data } = await api.put(`/brands/${id}`, payload);
    return mapBrand(data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/brands/${id}`);
  }
};
