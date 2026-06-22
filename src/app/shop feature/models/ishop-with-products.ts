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

export interface IShopWithProducts {
  id: string;
  name: string;
  descriptionEn?: string;
  descriptionAr?: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  ownerName: string;
  products: IProductSummary[];
}