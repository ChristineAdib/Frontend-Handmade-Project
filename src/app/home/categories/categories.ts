import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LanguageService } from '../../core/services/language.service';
import { CategoryService } from '../../Categories/Services/category.service';
import { ProductsService } from '../../products feature/services/products-service';
 
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
export class CategoriesComponent implements OnInit {
  protected readonly langService = inject(LanguageService);
  private categoryService = inject(CategoryService);
  private productsService = inject(ProductsService);
 
  categories: Category[] = [
    {
      name: 'Pottery',
      key: 'pottery',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80',
      productCount: 0
    },
    {
      name: 'Beads',
      key: 'beads',
      image: 'https://th.bing.com/th/id/R.f1f8fcf3b9093a83ade8b32ea89a070b?rik=E25QPUjbCikesA&pid=ImgRaw&r=0',
      productCount: 0
    },
    {
      name: 'Crochet',
      key: 'crochet',
      image: 'https://i.pinimg.com/736x/8f/d3/b9/8fd3b938c9f3e89f2d36a454f5c605de.jpg',
      productCount: 0
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
 
  ngOnInit(): void {
    this.loadRealCounts();
  }
 
  private async loadRealCounts(): Promise<void> {
    // نجيب الكاتيجوريز (مع الـ subCategories) مرة واحدة بس
    if (this.categoryService.categories().length === 0) {
      await this.categoryService.loadAll();
    }
    const allCategories = this.categoryService.categories();
 
    // بس الكاتيجوريز الحقيقية (مش comingSoon) هي اللي هنجيبلها عدد فعلي
    const realCategories = this.categories.filter(c => !c.comingSoon);
 
    const requests = realCategories.map(cat => {
      const matched = allCategories.find(
        c => c.nameEn.toLowerCase() === cat.name.toLowerCase()
      );
 
      if (!matched) {
        return of({ totalCount: 0 });
      }
 
      const subIds = (matched.subCategories || []).map(s => s.id);
      const categoryIds = [matched.id, ...subIds];
 
      return this.productsService.getProducts({
        pageIndex: 1,
        pageSize: 1,
        categoryIds
      }).pipe(
        catchError(() => of({ totalCount: 0 }))
      );
    });
 
    // بنستخدم forkJoin عشان نستنى كل الطلبات تخلص مع بعض
    // الترتيب بيتحفظ زي ما هو في requests[]، فبنعتمد على الـ index مباشرة
    forkJoin(requests).subscribe({
      next: (results) => {
        results.forEach((res: any, index: number) => {
          const cat = realCategories[index];
          const target = this.categories.find(c => c.key === cat.key);
          if (target) {
            target.productCount = res?.totalCount ?? 0;
          }
        });
      },
      error: () => {
        // في حالة فشل كل الطلبات، تفضل productCount = 0 (already default)
      }
    });
  }
 
  getQueryParams(cat: Category): { category: string } | null {
    return cat.comingSoon ? null : { category: cat.name.toLowerCase() };
  }
}