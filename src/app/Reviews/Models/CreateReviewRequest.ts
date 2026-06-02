export interface CreateReviewRequest {
  productId: string;
  rating: number;
  comment?: string | null;
}