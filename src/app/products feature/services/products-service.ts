import { Injectable } from '@angular/core';
import { ICategory } from '../../models/icategory';
import { IProduct } from '../../models/iproduct';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {

  //Data
  categories: ICategory[] = [
      { ID: 1, Name: 'Jewelry' },
      { ID: 2, Name: 'Pottery' },
      { ID: 3, Name: 'Embroidery' },
    ];


  ProductList: IProduct[] = [
      { ID: 1, Name: 'Silver Bracelet',    Quantity: 5, Price: 250, Img: 'silverBracelet.jpg',  CategoryID: 1 },
      { ID: 2, Name: 'Gold Necklace',      Quantity: 2, Price: 500, Img: 'necklace.jpg',  CategoryID: 1 },
      { ID: 3, Name: 'Clay Vase',          Quantity: 1, Price: 180, Img: 'vase.jpg',      CategoryID: 2 },
      { ID: 4, Name: 'Ceramic Bowl',       Quantity: 0, Price: 120, Img: 'bowl.jpg',      CategoryID: 2 },
      { ID: 5, Name: 'Embroidered Bag',    Quantity: 3, Price: 350, Img: 'bag.jpg',       CategoryID: 3 },
      { ID: 6, Name: 'Hand-painted Scarf', Quantity: 0, Price: 200, Img: 'handmadeScarf.jpg',     CategoryID: 3 },
  ];



  //Logic
  buy(product: IProduct): void {
    if (product.Quantity > 0) {
      product.Quantity--;
    }
  }

  getStockStatus(qty:number): string{
    switch(true){
      case qty === 0: return 'Out of Stock';
      case qty === 1: return 'Last One Item!';
      case qty === 2: return 'Last Two Items!';
      default:        return 'In Stock';
    }
  }


  getProductById(id: number): IProduct | null{
    return this.ProductList.find(p => p.ID === id) || null;
  }



  getFilteredProducts(searchName: string, categoryID: number): IProduct[] {
    return this.ProductList.filter(p => {
      const matchName = p.Name.toLowerCase()
                        .includes(searchName.toLowerCase());
      const matchCat = categoryID == 0 || p.CategoryID == categoryID;
      return matchName && matchCat;
    });
  }

}
