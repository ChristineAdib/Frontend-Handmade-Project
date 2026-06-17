export interface ReviewSummary {
  rating: number;
  comment: string | null;
  userName: string;
  createdAt: string;
  isVerifiedPurchase: boolean;
}