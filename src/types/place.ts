export interface PlaceDetailResponse {
  id: number;
  name: string;
  description: string;
  avgRating: number;
  sido: string;
  sigungu: string;
  roadName: string;
  detailAddress: string;
  fileUrls: string[];
  rooms: any[]; // TODO: Room 타입 정의 필요
}
