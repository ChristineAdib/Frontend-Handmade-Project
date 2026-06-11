import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ShopService } from '../../services/shop-service';
import { AuthService } from '../../../auth/Services/auth';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-become-seller',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './become-seller.component.html',
  styleUrls: ['./become-seller.component.css']
})
export class BecomeSellerComponent {
  private readonly shopService = inject(ShopService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  protected readonly langService = inject(LanguageService);

  // Form Fields
  name = signal<string>('');
  descriptionEn = signal<string>('');
  descriptionAr = signal<string>('');

  // Logo upload state
  selectedFile = signal<File | null>(null);
  logoPreview = signal<string | null>(null);

  // States
  isLoading = signal<boolean>(false);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.toastr.error(
          this.langService.currentLang() === 'ar'
            ? 'يرجى اختيار ملف صورة صالح.'
            : 'Please select a valid image file.'
        );
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        this.toastr.error(
          this.langService.currentLang() === 'ar'
            ? 'حجم الصورة يجب أن يكون أقل من 2 ميجابايت.'
            : 'Image size must be less than 2MB.'
        );
        return;
      }

      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    if (!this.name().trim()) {
      this.toastr.error(
        this.langService.currentLang() === 'ar'
          ? 'اسم المتجر مطلوب.'
          : 'Shop name is required.'
      );
      return;
    }

    this.isLoading.set(true);

    const formData = new FormData();
    formData.append('Name', this.name().trim());
    formData.append('DescriptionEn', this.descriptionEn().trim());
    formData.append('DescriptionAr', this.descriptionAr().trim());

    const file = this.selectedFile();
    if (file) {
      formData.append('Logo', file, file.name);
    }

    this.shopService.createShop(formData).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toastr.success(
          this.langService.currentLang() === 'ar'
            ? 'تم إنشاء متجرك بنجاح وتفعيل حساب البائع الخاص بك!'
            : 'Your shop was created successfully and your seller account is activated!'
        );
        
        // Update user session in auth service
        if (res && res.auth) {
          this.authService.updateSession(res.auth);
        }

        // Redirect to Seller Dashboard Overview
        this.router.navigate(['/seller/overview']);
      },
      error: (err) => {
        console.error('Failed to create shop', err);
        this.isLoading.set(false);
        const errorMsg = err.error?.[0] || err.error?.message || (
          this.langService.currentLang() === 'ar'
            ? 'فشل إنشاء المتجر. يرجى المحاولة مرة أخرى.'
            : 'Failed to create shop. Please try again.'
        );
        this.toastr.error(errorMsg);
      }
    });
  }
}
