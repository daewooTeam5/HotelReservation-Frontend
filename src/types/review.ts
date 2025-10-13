// daewooteam5/hotelreservation-frontend/HotelReservation-Frontend-feature-review3/src/types/review.ts
export interface ReviewComment {
  comment: string;
  managerName: string;
  createdAt: string;
}

export interface ReviewResponse {
  reviewId: number;
  userName: string;
  userId: number; // <-- [추가] userId 타입
  rating: number;
  comment: string;
  createdAt: string;
  imageUrls: string[];
  commentByOwner: ReviewComment | null;
  // ===== ✅ 새로 추가된 타입 =====
  roomType: string;
  nights: number;
}
