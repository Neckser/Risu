export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload extends UserCredentials {
  name: string;
}
