export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  roleId: number;
  roleName: string;
  status: string;
  permissions: Permission[];
}

export interface Permission {
  module: string;
  action: string;
  isGranted: boolean;
}

export interface StaffMember {
  id: number;
  username: string;
  fullName: string;
  email: string;
  status: string;
  roleId: number;
  roleName: string;
}
