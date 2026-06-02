export interface IShopFilter {
  search?: string;
  minRating?: number;
  isVerified?: boolean;
  sortBy?: string;
  pageNumber?: number;
  pageSize?: number;
}