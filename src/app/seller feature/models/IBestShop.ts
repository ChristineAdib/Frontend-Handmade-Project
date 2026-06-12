export interface IBestShop {
  id: string;
  name: string;
  logo: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  rating: number;
  reviewCount: number;
  totalSales: number;
  isVerified: boolean;
  ownerName: string;
  productCount: number;
}