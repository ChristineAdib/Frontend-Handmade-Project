export interface IProductSummary {
  id: string;
  titleEn: string;
  titleAr: string;
  price: number;
  discountPrice?: number;
  finalPrice: number;
  mainImageUrl?: string;
  averageRating: number;
  reviewCount: number;
  categoryNameEn: string;
  shopName: string;
  arModelUrl?: string;
}