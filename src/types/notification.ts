import type { User } from '@/types/users.ts';

export type Notification ={
  createdAt: string;
  id: number;
  title: string;
  content: string;
  notificationType: NotificationType;
  user: User;
}

export type NotificationType = 'RESERVATION'|'CHECKIN'|'CHECKOUT'|'COMMON'|'AD'|'ADMIN'
