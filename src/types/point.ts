export type PointHistoryType = 'EARN' | 'USE' ;

export interface PointHistoryItem {
  id: number;
  type: PointHistoryType;
  expireAt: string;
  amount: number;
  orderId: string;
  hotelName: string;
  createdAt: string;
  roomType: string;
  bedType: string;
  reservationId: number;
  balanceAfter: number;
}








