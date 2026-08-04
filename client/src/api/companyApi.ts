import apiClient from './apiClient';

export interface Company {
  id: number;
  userId: number;
  name: string;
  description?: string;
  gstNumber?: string;
  licenseUrl?: string;
  isVerified: boolean;
  user?: {
    name: string;
    email: string;
  };
  packages?: { id: number }[];
}

export const fetchMyCompany = async (): Promise<Company> => {
  const response = await apiClient.get('/companies/me');
  return response.data;
};

export const fetchAllCompanies = async (): Promise<Company[]> => {
  const response = await apiClient.get('/companies');
  return response.data;
};

export const createCompany = async (data: Partial<Company>): Promise<Company> => {
  const response = await apiClient.post('/companies', data);
  return response.data;
};

export const verifyCompany = async (id: number, isVerified: boolean): Promise<Company> => {
  const response = await apiClient.patch(`/companies/${id}/verify`, { isVerified });
  return response.data;
};
