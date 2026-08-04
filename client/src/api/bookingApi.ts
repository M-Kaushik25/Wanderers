/**
 * MOD-07 Booking System – Frontend API Client
 * Aligns exactly with UX specification SCR-08 (Booking Modal) and SCR-05 (Tourist Profile)
 * All status values match the booking lifecycle diagram in Phase 7 of ux_planning_and_screen_specs.md
 */

import apiClient from './apiClient';

// ─── Booking Lifecycle States (Phase 7 of UX spec) ───────────────────────
export type BookingStatus =
  | 'PENDING'     // Submitted by Tourist — awaiting operator action
  | 'CONFIRMED'   // Accepted by Operator — trip is scheduled
  | 'COMPLETED'   // Trip finished — tourist may now submit review (MOD-09)
  | 'REJECTED'    // Declined by Operator
  | 'CANCELLED';  // Refunded / withdrawn

// ─── Booking Data Shape ───────────────────────────────────────────────────
export interface Booking {
  id: number;
  touristId: number;
  packageId: number;
  travelDate: string;      // ISO date string
  passengers: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  // Included relations
  package: {
    id: number;
    title: string;
    destination: string;
    price: number;
    durationDays: number;
    coverImage?: string;
    description?: string;
    itinerary?: string;
    company?: {
      id: number;
      name: string;
      isVerified: boolean;
    };
  };
  tourist?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

// ─── API Functions ─────────────────────────────────────────────────────────

/**
 * SCR-08: Submit a new booking reservation.
 * Server enforces: travelDate >= today, passengers >= 1, totalAmount = price * passengers
 */
export const createBooking = async (
  packageId: number,
  travelDate: string,
  passengers: number
): Promise<Booking> => {
  const { data } = await apiClient.post<Booking>('/bookings', {
    packageId,
    travelDate,
    passengers
  });
  return data;
};

/**
 * SCR-05: Fetch current tourist's full booking history (most recent first).
 * Used in TouristProfile → My Bookings section.
 */
export const fetchMyBookings = async (): Promise<Booking[]> => {
  const { data } = await apiClient.get<Booking[]>('/bookings/me');
  return data;
};

// Alias for backward compatibility
export const getMyBookings = fetchMyBookings;

/**
 * Fetch a single booking record by ID (for Travel Voucher / print view).
 * Access: Tourist owner | Operator of package | Admin
 */
export const getBookingById = async (id: number): Promise<Booking> => {
  const { data } = await apiClient.get<Booking>(`/bookings/${id}`);
  return data;
};

/**
 * SCR-06: Fetch all incoming bookings for the operator's registered company.
 * Used in OperatorDashboard → Incoming Tourist Bookings table.
 */
export const fetchCompanyBookings = async (): Promise<Booking[]> => {
  const { data } = await apiClient.get<Booking[]>('/bookings/company');
  return data;
};

// Alias for backward compatibility
export const getCompanyBookings = fetchCompanyBookings;

/**
 * SCR-06: Update a booking's lifecycle status.
 * PENDING -> CONFIRMED | REJECTED
 * CONFIRMED -> COMPLETED | CANCELLED
 */
export const updateBookingStatus = async (
  id: number,
  status: BookingStatus
): Promise<Booking> => {
  const { data } = await apiClient.patch<Booking>(`/bookings/${id}/status`, { status });
  return data;
};
