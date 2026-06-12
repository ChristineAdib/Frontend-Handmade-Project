import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';

interface Category {
  name: string;
  key: 'pottery' | 'beads' | 'crochet' | 'macrame' | 'embroidery' | 'candles' | 'leatherCraft';
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
  protected readonly langService = inject(LanguageService);

  categories: Category[] = [
    {
      name: 'Pottery',
      key: 'pottery',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80',
      productCount: 24
    },
    {
      name: 'Beads',
      key: 'beads',
      image: 'https://th.bing.com/th/id/R.f1f8fcf3b9093a83ade8b32ea89a070b?rik=E25QPUjbCikesA&pid=ImgRaw&r=0',
      productCount: 18
    },
    {
      name: 'Crochet',
      key: 'crochet',
      image: 'https://i.pinimg.com/736x/8f/d3/b9/8fd3b938c9f3e89f2d36a454f5c605de.jpg',
      productCount: 31
    },
    {
      name: 'Macrame',
      key: 'macrame',
      image: 'https://images.unsplash.com/photo-1558618047-f4e60cde4b4e?w=600&q=80',
      productCount: 0,
      comingSoon: true
    },
    {
      name: 'Embroidery',
      key: 'embroidery',
      image: 'https://images.unsplash.com/photo-1597484661643-2f5fef640dd1?w=600&q=80',
      productCount: 0,
      comingSoon: true
    },
    {
      name: 'Candles',
      key: 'candles',
      image: 'https://images.unsplash.com/photo-1603905577369-0df6e89e6c93?w=600&q=80',
      productCount: 0,
      comingSoon: true
    },
    {
      name: 'Leather Craft',
      key: 'leatherCraft',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
      productCount: 0,
      comingSoon: true
    }
  ];

  getQueryParams(cat: Category): { category: string } | null {
    return cat.comingSoon ? null : { category: cat.name.toLowerCase() };
  }
}