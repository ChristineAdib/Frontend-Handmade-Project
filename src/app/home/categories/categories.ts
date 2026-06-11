import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Category {
  name: string;
  image: string;
  productCount: number;
  comingSoon?: boolean;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css']
})
export class CategoriesComponent {
  categories: Category[] = [
    {
      name: 'Pottery',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80',
      productCount: 24
    },
    {
      name: 'Beads',
      image: 'https://images.unsplash.com/photo-1573408301185-9519f94809a2?w=600&q=80',
      productCount: 18
    },
    {
      name: 'Crochet',
      image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&q=80',
      productCount: 31
    },
    {
      name: 'Macrame',
      image: 'https://images.unsplash.com/photo-1558618047-f4e60cde4b4e?w=600&q=80',
      productCount: 0,
      comingSoon: true
    },
    {
      name: 'Embroidery',
      image: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=600&q=80',
      productCount: 0,
      comingSoon: true
    },
    {
      name: 'Candles',
      image: 'https://images.unsplash.com/photo-1603905577369-0df6e89e6c93?w=600&q=80',
      productCount: 0,
      comingSoon: true
    },
    {
      name: 'Leather Craft',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
      productCount: 0,
      comingSoon: true
    }
  ];

  getQueryParams(cat: Category): { category: string } | null {
    return cat.comingSoon ? null : { category: cat.name.toLowerCase() };
  }
}