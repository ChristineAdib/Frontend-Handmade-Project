export interface IProductAPI {
  id: number;
  title: string;
  slug: string;
  price: number;
  description: string;
  category: ICategoryAPI;
  images: string[];
  creationAt: string;
  updatedAt: string;
}



export interface ICategoryAPI {
  id: number;
  name: string;
  slug: string;
  image: string;
  creationAt: string;
  updatedAt: string;
}
