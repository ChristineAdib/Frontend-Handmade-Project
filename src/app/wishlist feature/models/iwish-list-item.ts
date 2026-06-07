export interface IWishListItem {
 id: string;
  productId: string;
  titleEn: string;
  titleAr: string;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  quantity: number;
}
