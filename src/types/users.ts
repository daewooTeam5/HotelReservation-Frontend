export type UserLegacy = {
  username: string;
  role: string;
  id: number;
};

export type Role = 'customer' | 'hotel_owner' | 'admin' | 'place_admin' | 'user_admin';
export type Status = 'active' | 'inactive' | 'banned';

export type User = {
  id: number;
  userId: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  status: Status;
  updatedAt: string;
  createdAt: string;
  review: number;
}

export type UserInfo = Partial<User | { point: number }>

export type Guest = {
  email: string
  firstName: string
  id: number
  lastName: string
  phone: string,
  users: User
}
export type UserDto = {
  id: number;
  userId: string;
  email: string;
  name: string;
  role: Role;

}
export type LoginSuccessDto = {
  accessToken: string;
  user: User;
}
