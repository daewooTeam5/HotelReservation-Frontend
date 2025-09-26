export interface Reservation {
  reservationId: number;
  placeId: number;
}
export interface ReviewableReservation {
  reservationId: number;
  roomType: string;
  resevStart: string;
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


