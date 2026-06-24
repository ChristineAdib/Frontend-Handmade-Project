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

  isAnalyzing = signal(false);
agentImageBase64 = signal('');
agentMimeType = signal('');

  categories = signal<CategorySummary[]>([]);
  subCategories = signal<CategorySummary[]>([]);
  isLoading = signal(false);
  isLoadingSubCategories = signal(false);
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
    subCategoryId: ['', Validators.required],
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
    console.log('[AddProduct] Loading categories...');
    this.productService.getCategories().subscribe({
      next: cats => {
        console.log('[AddProduct] Categories loaded successfully:', cats);
        this.categories.set(cats as unknown as CategorySummary[]);
      },
      error: (err) => {
        console.error('[AddProduct] Failed to load categories:', err);
        this.errorMsg.set(this.langService.currentLang() === 'ar' ? 'فشل تحميل الفئات' : 'Failed to load categories');
      }
    });

    // Get shopId
    this.shopService.getMyShop().subscribe({
      next: shop => this.shopId.set(shop.id),
    });
  }

  loadSubCategories(parentId: string) {
    this.isLoadingSubCategories.set(true);
    console.log('[AddProduct] Loading subcategories for parent:', parentId);
    this.productService.getSubCategories(parentId).subscribe({
      next: (subs) => {
        console.log('[AddProduct] Subcategories loaded successfully:', subs);
        this.subCategories.set(subs as unknown as CategorySummary[]);
        
        const subCategoryCtrl = this.form.get('subCategoryId');
        if (subs && subs.length === 0) {
          subCategoryCtrl?.clearValidators();
          subCategoryCtrl?.setValue(parentId);
        } else {
          subCategoryCtrl?.setValidators(Validators.required);
          const currentVal = subCategoryCtrl?.value;
          if (!subs.some(s => s.id === currentVal)) {
            subCategoryCtrl?.setValue('');
          }
        }
        subCategoryCtrl?.updateValueAndValidity();
        this.isLoadingSubCategories.set(false);
      },
      error: (err) => {
        console.error('[AddProduct] Failed to load subcategories:', err);
        this.errorMsg.set(this.langService.currentLang() === 'ar' ? 'فشل تحميل الفئات الفرعية' : 'Failed to load subcategories');
        this.isLoadingSubCategories.set(false);
      }
    });
  }

  onCategoryChange(event: Event) {
    const parentId = (event.target as HTMLSelectElement).value;
    this.form.patchValue({ subCategoryId: '' });
    this.form.get('subCategoryId')?.markAsTouched();
    this.subCategories.set([]);
    if (parentId) {
      this.loadSubCategories(parentId);
    } else {
      const subCategoryCtrl = this.form.get('subCategoryId');
      subCategoryCtrl?.setValidators(Validators.required);
      subCategoryCtrl?.updateValueAndValidity();
    }
  }

  onImagesSelected(event: Event) {
    const files = Array.from((event.target as HTMLInputElement).files || []);
    if (!files.length) return;



    this.agentMimeType.set(files[0].type);
  const reader0 = new FileReader();
  reader0.onload = () => {
    this.agentImageBase64.set((reader0.result as string).split(',')[1]);
  };
  reader0.readAsDataURL(files[0]);



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
    formData.append('subCategoryId', v.subCategoryId!);
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
        setTimeout(() => {
          this.router.navigateByUrl('/').then(() => {
            this.router.navigate(['/seller/products']);
          });
        }, 1500);
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
        const parentId = product.parentCategoryId;
        const subId = product.categoryId;

        this.form.patchValue({
          titleEn: product.titleEn,
          titleAr: product.titleAr,
          descriptionEn: product.descriptionEn ?? '',
          descriptionAr: product.descriptionAr ?? '',
          price: product.price,
          quantity: product.quantity,
          categoryId: parentId || subId || '',
          subCategoryId: parentId ? subId : subId || '',
        });

        if (parentId) {
          this.loadSubCategories(parentId);
        } else if (subId) {
          this.loadSubCategories(subId);
        }

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
    } else {
      this.isEditMode.set(false);
      this.productId.set(null);
      this.resetForm();
    }
  }

  private resetForm() {
    this.form.reset({
      titleEn: '',
      titleAr: '',
      descriptionEn: '',
      descriptionAr: '',
      price: 0,
      quantity: 1,
      categoryId: '',
      subCategoryId: ''
    });
    this.subCategories.set([]);
    this.imagePreviews.set([]);
    this.selectedImages.set([]);
    this.tags.set([]);
    this.successMsg.set(null);
    this.errorMsg.set(null);
    this.existingImages.set([]);
    this.removeImageIds.set([]);
  }

  onCancel() {
    this.router.navigateByUrl('/').then(() => {
      this.router.navigate(['/seller/products']);
    });
  }
  
  analyzeWithAgent() {
  if (!this.agentImageBase64()) return;
  this.isAnalyzing.set(true);

  this.productService.analyzeProductImage(
    this.agentImageBase64(),
    this.agentMimeType()
  ).subscribe({
    next: (result) => {
      this.form.patchValue({
        titleEn: result.titleEn,
        titleAr: result.titleAr,
        descriptionEn: result.descriptionEn,
        descriptionAr: result.descriptionAr,
        price: result.suggestedPrice,
      });
      if (result.tags?.length) {
        this.tags.set(result.tags);
      }
      this.isAnalyzing.set(false);
    },
    error: () => {
      this.errorMsg.set('Failed to analyze image. Please try again.');
      this.isAnalyzing.set(false);
    }
  });
}
}