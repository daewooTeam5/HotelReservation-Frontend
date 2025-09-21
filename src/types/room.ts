export type Room = {
  bedType: string;
  capacityPeople: number;
  capacityRoom: number;
  price: number;
  roomType: string;
  status: 'AVAILABLE'|'RESERVED'|'CLEANING'
};

export type RoomInfo = {
  id: number;
  price: number;
  roomName: string;
  finalPrice: number;
  placeId: number;
  availableCount: number;
  discountPercent: number;
};
