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

// Place reference for available coupons (minimal fields needed)
export type PlaceRef = {
  id: number;
  name: string;
  // allow extra fields without strict typing
  [key: string]: any;
};

// Available coupons for a specific place (from /v1/places/{placeId}/available/coupons)
export type AvailablePlaceCoupon = {
  id: number;
  place: PlaceRef;
  couponName: string;
  createdAt: string;
  expiredAt: string;
  amount: number;
  couponType: 'rate' | 'amount';
  couponCode: string;
  minOrderAmount: number;
  maxOrderAmount: number;
  issuable: boolean;
};
