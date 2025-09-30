export interface Amenity {
  id: number;
  name: string;
  icon: string;
  type: string;
  checked?: boolean; // 선택 상태 (클라이언트에서 추가)
}

