import api from '../index';
import { Category } from '@/lib/types';

const mapCategory = (c: Category & { _id: string }): Category => ({ ...c, id: c._id });

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await api.get('/categories');
    return data.map(mapCategory);
  },

  create: async (payload: Partial<Category>): Promise<Category> => {
    const { data } = await api.post('/categories', payload);
    return mapCategory(data);
  },

  update: async (id: string, payload: Partial<Category>): Promise<Category> => {
    const { data } = await api.put(`/categories/${id}`, payload);
    return mapCategory(data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  }
};
