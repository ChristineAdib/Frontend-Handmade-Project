export interface IProductAPI {
  id: number;
  title: string;
  titleEn?: string;
  titleAr?: string;
  slug: string;
  price: number;
  description: string;
  descriptionEn?: string;
  descriptionAr?: string;
  category: ICategoryAPI;
  images: string[];
  creationAt: string;
  updatedAt: string;
}



export interface ICategoryAPI {
  id: number;
  name: string;
  nameEn?: string;
  nameAr?: string;
  slug: string;
  image: string;
  creationAt: string;
  updatedAt: string;
}
