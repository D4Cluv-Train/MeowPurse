export interface UserProfile {
  user_id: number;
  username: string;
  nickname: string;
  avatar: string;
  email: string | null;
  phone: string | null;
  signature: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}
