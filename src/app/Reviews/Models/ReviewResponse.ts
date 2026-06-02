export interface ReviewResponse {
  id: string;
  rating: number;
  comment: string | null;
  userName: string;
  createdAt: string;
}