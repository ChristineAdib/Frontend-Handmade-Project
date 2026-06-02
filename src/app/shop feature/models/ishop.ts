export interface IShop {
  id: string;
  name: string;
  descriptionEn?: string;
  descriptionAr?: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  totalSales: number;
  isVerified: boolean;
  ownerName: string;
  productCount: number;
}