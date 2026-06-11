import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ShopService } from '../../../shop feature/services/shop-service';
import { IShop } from '../../../shop feature/models/ishop';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  private shopService = inject(ShopService);
  private fb = inject(FormBuilder);
  protected readonly langService = inject(LanguageService);

  shop = signal<IShop | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);
  logoPreview = signal<string | null>(null);
  selectedLogoFile = signal<File | null>(null);

  form = this.fb.group({
    name:          ['', Validators.required],
    descriptionEn: [''],
    descriptionAr: [''],
  });

  ngOnInit() {
    this.shopService.getMyShop().subscribe({
      next: shop => {
        this.shop.set(shop);
        this.form.patchValue({
          name:          shop.name,
          descriptionEn: shop.descriptionEn ?? '',
          descriptionAr: shop.descriptionAr ?? '',
        });
        if (shop.logo) this.logoPreview.set(shop.logo);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set(this.langService.currentLang() === 'ar' ? 'فشل تحميل بيانات المتجر' : 'Failed to load shop data');
        this.isLoading.set(false);
      }
    });
  }

  onLogoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedLogoFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.logoPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  onRemoveLogo() {
    this.selectedLogoFile.set(null);
    this.logoPreview.set(null);
  }

  onSave() {
    if (this.form.invalid || !this.shop()) return;
    this.isSaving.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);

    const v = this.form.value;
    const formData = new FormData();
    if (v.name)          formData.append('name', v.name);
    if (v.descriptionEn) formData.append('descriptionEn', v.descriptionEn);
    if (v.descriptionAr) formData.append('descriptionAr', v.descriptionAr);
    if (this.selectedLogoFile()) formData.append('logo', this.selectedLogoFile()!);

    this.shopService.updateShop(this.shop()!.id, formData as any).subscribe({
      next: updated => {
        this.shop.set(updated);
        this.isSaving.set(false);
        this.successMsg.set(this.langService.currentLang() === 'ar' ? 'تم تحديث المتجر بنجاح!' : 'Shop updated successfully!');
        setTimeout(() => this.successMsg.set(null), 3000);
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMsg.set(this.langService.currentLang() === 'ar' ? 'فشل تحديث المتجر. يرجى المحاولة مرة أخرى.' : 'Failed to update shop. Please try again.');
      }
    });
  }
}