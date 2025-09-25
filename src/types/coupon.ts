export type UserCoupon = {
  amount: number;
  couponName: string;
  expiredAt: string;
  couponType: "rate" | "amount";
  userId: number;
  isUsed: boolean;
  placeName: string;
  placeId: number;
  minOrderAmount: number;
  placeImageUrl: string;
};
