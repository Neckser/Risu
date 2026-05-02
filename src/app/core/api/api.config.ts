export const API_BASE_URL = '/api';

export const API_PATHS = {
  authLogin: `${API_BASE_URL}/auth/login`,
  authRegister: `${API_BASE_URL}/auth/register`,
  authMe: `${API_BASE_URL}/auth/me`,
  subscriptions: `${API_BASE_URL}/subscriptions`,
  subscriptionById: (id: string) => `${API_BASE_URL}/subscriptions/${id}`,
  categories: `${API_BASE_URL}/categories`,
  categoryById: (id: string) => `${API_BASE_URL}/categories/${id}`,
} as const;

export const MOCK_NETWORK_DELAY_MS = 250;
