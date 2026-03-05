export interface AuthResponse {
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'technician';
    store: any;
  };
  storeId?: string;
  userId?: string;
}

export interface LoginPayload {
  email?: string;
  password?: string;
}

export interface RegisterPayload {
  storeName?: string;
  userName?: string;
  email?: string;
  password?: string;
}
