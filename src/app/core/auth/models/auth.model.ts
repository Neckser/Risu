import { User } from './user.model';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  status: number;
  message: string;
}
