import { IWishListItem } from "./iwish-list-item";

export interface IWishList {
     id: string;
  userId: string;
  items: IWishListItem[];
  totalItems: number;
}