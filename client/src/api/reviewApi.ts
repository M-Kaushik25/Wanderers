import apiClient from './apiClient';

export interface Review {
  id: number;
  touristId: number;
  packageId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  tourist?: {
    name: string;
  };
}

export const getPackageReviews = async (packageId: number): Promise<Review[]> => {
  const response = await apiClient.get<Review[]>(`/reviews/package/${packageId}`);
  return response.data;
};

export const createReview = async (
  packageId: number,
  rating: number,
  comment?: string
): Promise<Review> => {
  const response = await apiClient.post<Review>('/reviews', {
    packageId,
    rating,
    comment
  });
  return response.data;
};
