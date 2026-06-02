export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
  role: string;
  bio?: string;
  profileImage?: File;
}