import apiClient from './apiClient';

export interface Package {
  id: number;
  title: string;
  description: string;
  destination: string;
  durationDays: number;
  price: number;
  coverImage?: string;
  itinerary: string;
  companyId: number;
  company?: {
    name: string;
    isVerified: boolean;
  };
}

export interface CreatePackageParams {
  title: string;
  description: string;
  destination: string;
  durationDays: number;
  price: number;
  coverImage?: string;
  itinerary: string;
}

export const fetchPackages = async (): Promise<Package[]> => {
  const response = await apiClient.get('/packages');
  return response.data;
};

export const createPackage = async (data: CreatePackageParams): Promise<Package> => {
  const response = await apiClient.post('/packages', data);
  return response.data;
};

export const updatePackage = async ({ id, data }: { id: number; data: Partial<CreatePackageParams> }): Promise<Package> => {
  const response = await apiClient.put(`/packages/${id}`, data);
  return response.data;
};

export const deletePackage = async (id: number): Promise<void> => {
  await apiClient.delete(`/packages/${id}`);
};
