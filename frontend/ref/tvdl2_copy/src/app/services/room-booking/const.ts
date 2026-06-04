export enum RoomType {
  CS1 = 'cs1',
  CS2_TANG1 = 'cs2_tang1',
  CS2_TANG2 = 'cs2_tang2',
}

export const ROOM_TYPE_OPTIONS = [
  { value: RoomType.CS1, label: 'Cơ sở 1' },
  { value: RoomType.CS2_TANG1, label: 'Cơ sở 2 - Tầng 1' },
  { value: RoomType.CS2_TANG2, label: 'Cơ sở 2 - Tầng 2' },
];

export const getRoomNameByType = (roomType: RoomType) => {
  const room = ROOM_TYPE_OPTIONS.find(r => r.value === roomType);
  return room ? room.label : 'Unknown Room';
}