import { RoomType } from "../services/room-booking/const";
import { ItemType } from "./const";

export interface Event {
  id: string;
  title: string;
  description?: string;
  location: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  maxParticipants?: number;
  currentParticipants: number;
  status: string;
  featured?: boolean;
  color?: string;
  type: ItemType.EVENT;
}

export interface RoomBooking {
  id: string;
  fullName: string;
  roomType: RoomType;
  bookingDate: string;
  timeSlot: string;
  startTime: string;
  endTime: string;
  participants: number;
  purpose: string;
  status: string;
  type: ItemType.BOOKING;
}

export type CalendarItem = Event | RoomBooking;