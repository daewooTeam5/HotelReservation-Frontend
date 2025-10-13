import type { User } from '@/types/users.ts';

export interface Business {
  id: number;
  rejectionReason: string | null;
  businessNumber: string;
  user: User;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
