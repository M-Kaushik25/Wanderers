import apiClient from './apiClient';

export interface Booking {
  id: number;
  touristId: number;
  packageId: number;
  travelDate: string;
  passengers: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  package?: {
    title: string;
    destination?: string;
    coverImage?: string;
  };
  tourist?: {
    name: string;
    email: string;
  };
}

export interface CreateBookingParams {
  packageId: number;
  travelDate: string;
  passengers: number;
  totalAmount: number;
}

export const createBooking = async (data: CreateBookingParams) => {
  const response = await apiClient.post('/bookings', data);
  return response.data;
};

export const fetchMyBookings = async (): Promise<Booking[]> => {
  const response = await apiClient.get('/bookings/me');
  return response.data;
};

export const fetchCompanyBookings = async (): Promise<Booking[]> => {
  const response = await apiClient.get('/bookings/company');
  return response.data;
};

export const updateBookingStatus = async (id: number, status: string): Promise<Booking> => {
  const response = await apiClient.patch(`/bookings/${id}/status`, { status });
  return response.data;
};
