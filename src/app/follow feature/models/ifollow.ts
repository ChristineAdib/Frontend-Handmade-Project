export interface IFollow {
  shopId: string;
  shopName: string;
  shopLogo?: string;
  rating: number;
  isVerified: boolean;
  followedAt: Date;
}