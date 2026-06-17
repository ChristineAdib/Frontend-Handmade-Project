export interface AuthResponse {
  userId: string;
  name: string;
  email: string;
  token: string;
  tokenExpiry: string;
  roles: string[];
  profileImage?: string;
}