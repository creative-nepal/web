export interface RoleView {
  role: string;
  permission: Record<string, string[]>;
  isBuiltIn: boolean;
  granted?: Record<string, string[]>;
}

export interface RoleCatalogue {
  statements: Record<string, string[]>;
  roles: RoleView[];
}

export interface RoleInput {
  role: string;
  permission: Record<string, string[]>;
}
