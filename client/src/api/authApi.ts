import apiClient from './apiClient';

export interface LoginParams {
  email: string;
  password: string;
}

export interface SignupParams {
  name: string;
  email: string;
  password: string;
  role: 'TOURIST' | 'OPERATOR';
}

export const loginUser = async (data: LoginParams) => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};

export const signupUser = async (data: SignupParams) => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};
