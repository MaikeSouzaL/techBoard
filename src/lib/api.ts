// ========================================
// RepairHub — API Client
// ========================================
// Centralized HTTP client for calling the Python backend.
// In dev: http://localhost:8000
// In Electron: can be configured via NEXT_PUBLIC_API_URL

import axios, { isAxiosError } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  // Set a high timeout for AI processing
  timeout: 60000, 
  maxBodyLength: Infinity,
  maxContentLength: Infinity
});

// ===== Health =====
export async function healthCheck(): Promise<{ status: string; service: string; version: string }> {
  try {
    const { data } = await apiClient.get('/health');
    return data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || error.message || 'API Error');
    }
    throw error;
  }
}

// ===== Image Processing =====
export interface RemoveBgOptions {
  image: string;      // base64 or data URL
  upscale?: boolean;
  target_width?: number;
  sharpen?: boolean;
}

export interface RemoveBgResult {
  cleanImage: string;  // data URL: data:image/png;base64,...
}

export async function removeBackground(options: RemoveBgOptions): Promise<RemoveBgResult> {
  try {
    const { data } = await apiClient.post<RemoveBgResult>('/api/remove-bg', options);
    return data;
  } catch (error: unknown) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || error.message || 'API Error');
    }
    throw error;
  }
}
