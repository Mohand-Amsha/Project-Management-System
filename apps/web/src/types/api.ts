export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "pm" | "member";
  organization: string | Organization;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "enterprise";
  owner: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}