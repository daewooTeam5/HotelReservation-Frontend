export interface Reservation {
  reservationId: number;
  placeId: number;
}
export interface ReviewableReservation {
  reservationId: number;
  roomType: string;
  resevStart: string;
}
export interface NonMemberReservationDetail {
  firstImageUrl: string | null;
  firstName: string;
  lastName: string;
  paymentId: number;
  paymentKey: string;
  orderId: string;
  status: string;
  method: string;
  amount: number;
  transactionDate: string;
  reservationId: number;
  resevStart: string;
  resevEnd: string;
  request: string | null;
  baseAmount: number;
  finalAmount: number;
  fixedDiscountAmount: number;
  couponDiscountAmount: number;
  pointDiscountAmount: number;
  placeId: number;
  placeName: string;
  checkIn: string;
  roomId: number;
  roomType: string;
  roomPrice: number;

}

export type ReservationPayment = {
  method: string;
  guestFirstName: string;
  guestLastName: string;
  firstImageUrl: string;
  reservationId: number;
  transactionDate: string; // ISO datetime string
  status: "paid" | "pending" | "cancelled"; // 확장 가능
  orderId: string;
  paymentKey: string;
  roomId: number;
  roomNumber: number;
  roomType: string;
  resevStart: string; // yyyy-MM-dd
  resevEnd: string;   // yyyy-MM-dd
  amount: number;
  placeName: string;
  placeId: number;
  guestId: number;
  paymentId: number;
};
export type PaymentDetail = {
  method: string;
  couponDiscountAmount: number;
  minOrderAmount: number;
  fixedDiscountAmount: number | null;
  pointDiscountAmount: number | null;
  maxOrderAmount: number;
  reservationId: number;
  transactionDate: string;
  firstImageUrl: string;
  couponHistoryId: number;
  discountAmount: number;
  couponStatus: string;
  couponAmount: number;
  couponCreatedAt: string;
  couponExpiredAt: string;
  couponName: string;
  placeId: number;
  placeName: string;
  status: string;
  roomType: string;
  resevStart: string;
  resevEnd: string;
  finalAmount: number;
  baseAmount: number;
  couponCode: string;
  couponType: string;
  amount: number;
  orderId: string;
  paymentKey: string;
  roomId: number;
  checkIn: string;
  couponId: number;
  request?: string;
  paymentId: number;
  roomPrice: number;
  coupon?: {
    id: number;
    couponName: string;
    couponType: 'rate' | 'amount';
    amount: number;
    couponCode: string;
    expiredAt: string;
    minOrderAmount: number;
    maxOrderAmount: number;
  };

};

