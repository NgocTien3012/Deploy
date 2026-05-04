export type AuthUser = {
  Id_user: number;
  Name_user: string;
  Phone: string;
  Email: string;
  Address: string;
  Image: string | null;
  role: "user" | "stylist" | "admin" | "staff";
  Id_store: number;
  Province?: string;
  Ward?: string;
};

export type AuthResponse = {
  message: string;
  token?: string; // backward compatibility
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};
