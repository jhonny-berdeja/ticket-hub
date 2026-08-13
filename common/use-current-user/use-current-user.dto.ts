export interface CurrentUser {
  sub: number;
  email: string;
  roles: string[];
}

export type Status = "loading" | "authenticated" | "unauthenticated";
