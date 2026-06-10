import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
templateUrl: './categories.html',
styleUrl: './categories.css'
 
})
export class CategoriesComponent {

  categories = [
    {
      name: 'فخار',
      slug: 'pottery',
      count: 24,
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=500&q=80'
    },
    {
      name: 'خرز',
      slug: 'beads',
      count: 38,
      image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88578?w=500&q=80'
    },
    {
      name: 'كروشيه',
      slug: 'crochet',
      count: 31,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80'
    }
  ];

  constructor(private router: Router) {}

  navigateTo(slug: string) {
    this.router.navigate(['/shop'], { queryParams: { category: slug } });
  }
}