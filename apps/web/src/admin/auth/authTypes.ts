export type AuthRole = "admin" | "editor";

export type AuthUser = {
  id: string;
  role: AuthRole;
};

export type AuthStatus = "loading" | "guest" | "authed";
