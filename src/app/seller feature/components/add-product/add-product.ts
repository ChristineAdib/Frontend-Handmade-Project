import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../seller feature/services/product-service';
import { ShopService } from '../../../shop feature/services/shop-service';
  import { CategorySummary } from '../../../Categories/Models/CategorySummary';
import { Input } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct implements OnInit {
  private productService = inject(ProductService);
  private shopService = inject(ShopService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected readonly langService = inject(LanguageService);

  categories = signal<CategorySummary[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);
  imagePreviews = signal<string[]>([]);
  selectedImages = signal<File[]>([]);
  tagInput = signal('');
  tags = signal<string[]>([]);
  shopId = signal('');
  isEditMode = signal(false);
  productId = signal<string | null>(null);
  existingImages = signal<{ id: string; imageUrl: string }[]>([]);
  removeImageIds = signal<string[]>([]);

  form = this.fb.group({
    titleEn: ['', Validators.required],
    titleAr: ['', Validators.required],
    descriptionEn: [''],
    descriptionAr: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    categoryId: ['', Validators.required],
  });

  ngOnInit() {
    // Check edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(id);
      this.loadProductData(id);
    }

    // Load categories
    this.productService.getCategories().subscribe({
      next: cats => this.categories.set(cats as unknown as CategorySummary[]),
      error: () => this.errorMsg.set(this.langService.currentLang() === 'ar' ? 'فشل تحميل الفئات' : 'Failed to load categories')
    });

    // Get shopId
    this.shopService.getMyShop().subscribe({
      next: shop => this.shopId.set(shop.id),
    });
  }

  onImagesSelected(event: Event) {
    const files = Array.from((event.target as HTMLInputElement).files || []);
    if (!files.length) return;

    const newImages = [...this.selectedImages(), ...files];
    this.selectedImages.set(newImages);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.update(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number) {
    const existingCount = this.existingImages().length;
    if (index < existingCount) {
      const removedImg = this.existingImages()[index];
      if (removedImg.id) {
        this.removeImageIds.update(ids => [...ids, removedImg.id]);
      }
      this.existingImages.update(imgs => imgs.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingCount;
      this.selectedImages.update(imgs => imgs.filter((_, i) => i !== fileIndex));
    }
    this.imagePreviews.update(prev => prev.filter((_, i) => i !== index));
  }

  addTag() {
    const tag = this.tagInput().trim();
    if (tag && !this.tags().includes(tag)) {
      this.tags.update(t => [...t, tag]);
    }
    this.tagInput.set('');
  }

  removeTag(tag: string) {
    this.tags.update(t => t.filter(x => x !== tag));
  }

  onTagKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  onSave() {
    if (this.form.invalid) return;
    this.isSaving.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);

    const v = this.form.value;
    const formData = new FormData();

    formData.append('titleEn', v.titleEn!);
    formData.append('titleAr', v.titleAr!);
    if (v.descriptionEn) formData.append('descriptionEn', v.descriptionEn);
    if (v.descriptionAr) formData.append('descriptionAr', v.descriptionAr);
    formData.append('price', v.price!.toString());
    formData.append('quantity', v.quantity!.toString());
    formData.append('categoryId', v.categoryId!);
    formData.append('shopId', this.shopId());

    if (this.isEditMode()) {
      this.selectedImages().forEach(img => formData.append('newImages', img));
      this.removeImageIds().forEach(id => formData.append('removeImageIds', id));
    } else {
      this.selectedImages().forEach(img => formData.append('images', img));
    }
    this.tags().forEach(tag => formData.append('tags', tag));

    const request$ = this.isEditMode()
      ? this.productService.updateProduct(this.productId()!, formData)
      : this.productService.createProduct(formData);

    request$.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMsg.set(
          this.isEditMode()
            ? (this.langService.currentLang() === 'ar' ? 'تم تحديث المنتج!' : 'Product updated!')
            : (this.langService.currentLang() === 'ar' ? 'تم إنشاء المنتج!' : 'Product created!')
        );
        setTimeout(() => this.router.navigate(['/seller/products']), 1500);
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMsg.set(this.langService.currentLang() === 'ar' ? 'فشل حفظ المنتج. يرجى المحاولة مرة أخرى.' : 'Failed to save product. Please try again.');
      }
    });
  }

  private loadProductData(id: string) {
    this.productService.getProductById(id).subscribe({
      next: (product: any) => {
        this.form.patchValue({
          titleEn: product.titleEn,
          titleAr: product.titleAr,
          descriptionEn: product.descriptionEn ?? '',
          descriptionAr: product.descriptionAr ?? '',
          price: product.price,
          quantity: product.quantity,
          categoryId: product.categoryId,
        });
        if (product.images?.length) {
          const imgs = product.images.map((img: any) => ({ id: img.id, imageUrl: img.imageUrl }));
          this.existingImages.set(imgs);
          this.imagePreviews.set(imgs.map((img: any) => img.imageUrl));
        }
        if (product.tags?.length) this.tags.set(product.tags);
      }
    });
  }

  @Input() set editProductId(id: string | null) {
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(id);
      this.loadProductData(id);
    }
  }

  onCancel() {
    this.router.navigateByUrl('/').then(() => {
      this.router.navigate(['/seller/products']);
    });
  }
}