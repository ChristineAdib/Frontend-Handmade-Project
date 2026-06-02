export interface ISellerProfile {
  id: string;
  name: string;
  bio?: string;
  profileImage?: string;
  memberSince: Date;
  shopId: string;
  shopName: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
}