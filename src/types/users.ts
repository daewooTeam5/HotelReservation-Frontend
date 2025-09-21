export type UserLegacy = {
  username: string;
  role: string;
  id: number;
};

export type Role = 'customer' | 'hotel_owner' | 'admin';
export type Status = 'active' | 'inactive' | 'banned';

export type User =  {
  id: number;
  userId: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  status: Status;
  updatedAt: string;
  createdAt: string;
}
export type UserDto = {
  id: number;
  userId: string;
  email: string;
  name:string;
  role: Role;

}
export type LoginSuccessDto = {
  accessToken: string;
  user: User;
}
