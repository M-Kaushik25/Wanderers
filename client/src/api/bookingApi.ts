import apiClient from './apiClient';

export interface Booking {
  id: number;
  touristId: number;
  packageId: number;
  travelDate: string;
  passengers: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  package: {
    id: number;
    title: string;
    destination: string;
    price: number;
    durationDays: number;
    coverImage?: string;
    company?: {
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

export const createBooking = async (
  packageId: number,
  travelDate: string,
  passengers: number = 1
): Promise<Booking> => {
  const response = await apiClient.post<Booking>('/bookings', {
    packageId,
    travelDate,
    passengers
  });
  return response.data;
};

export const getMyBookings = async (): Promise<Booking[]> => {
  const response = await apiClient.get<Booking[]>('/bookings/me');
  return response.data;
};

export const fetchMyBookings = getMyBookings;

export const getBookingById = async (id: number): Promise<Booking> => {
  const response = await apiClient.get<Booking>(`/bookings/${id}`);
  return response.data;
};

export const getCompanyBookings = async (): Promise<Booking[]> => {
  const response = await apiClient.get<Booking[]>('/bookings/company');
  return response.data;
};

export const fetchCompanyBookings = getCompanyBookings;

export const updateBookingStatus = async (
  id: number,
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
): Promise<Booking> => {
  const response = await apiClient.patch<Booking>(`/bookings/${id}/status`, {
    status
  });
  return response.data;
};
