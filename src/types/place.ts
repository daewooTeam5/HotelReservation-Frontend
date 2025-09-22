import type { Room } from '@/types/room.ts';

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
  rooms: Room[]; // TODO: Room 타입 정의 필요
}
