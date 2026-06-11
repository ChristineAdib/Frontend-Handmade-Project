export interface UserReview {
  id: string;
  rating: number;
  comment?: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  createdAt: string;
}
