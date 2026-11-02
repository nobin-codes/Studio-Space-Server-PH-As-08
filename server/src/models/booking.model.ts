import { ObjectId } from "mongodb";

export type BookingStatus =
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled";

export interface Booking {
  _id?: ObjectId;
  studioId: ObjectId;
  studioTitle: string;
  userEmail: string;
  userName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}