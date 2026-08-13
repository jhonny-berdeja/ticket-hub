export const ROLE_OPTIONS = ["ADMIN", "DEV", "APPROVER"] as const;
export type Role = (typeof ROLE_OPTIONS)[number];

export interface EditableUser {
  id: number;
  name: string;
  lastname: string;
  email: string;
  roles: Role[];
}
