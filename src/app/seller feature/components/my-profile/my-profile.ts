import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SellerService } from '../../../seller feature/services/seller-service';
import { ISellerProfile } from '../../../seller feature/models/iseller-profile';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.css',
})
export class MyProfile implements OnInit {
  private sellerService = inject(SellerService);
  private fb = inject(FormBuilder);
  protected readonly langService = inject(LanguageService);

  profile = signal<ISellerProfile | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  successMsg = signal<string | null>(null);
  errorMsg = signal<string | null>(null);
  imagePreview = signal<string | null>(null);
  selectedImageFile = signal<File | null>(null);

  form = this.fb.group({
    name: ['', Validators.required],
    bio:  [''],
  });

  ngOnInit() {
    this.sellerService.getMyProfile().subscribe({
      next: profile => {
        this.profile.set(profile);
        this.form.patchValue({
          name: profile.name,
          bio:  profile.bio ?? '',
        });
        if (profile.profileImage) this.imagePreview.set(profile.profileImage);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMsg.set(this.langService.currentLang() === 'ar' ? 'فشل تحميل الملف الشخصي' : 'Failed to load profile');
        this.isLoading.set(false);
      }
    });
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedImageFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  onRemoveImage() {
    this.selectedImageFile.set(null);
    this.imagePreview.set(null);
  }

  onSave() {
    if (this.form.invalid) return;
    this.isSaving.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);

    const v = this.form.value;
    const formData = new FormData();
    if (v.name) formData.append('name', v.name);
    if (v.bio)  formData.append('bio', v.bio);
    if (this.selectedImageFile()) formData.append('profileImage', this.selectedImageFile()!);

    this.sellerService.updateMyProfile(formData).subscribe({
      next: updated => {
        this.profile.set(updated);
        this.isSaving.set(false);
        this.successMsg.set(this.langService.currentLang() === 'ar' ? 'تم تحديث الملف الشخصي بنجاح!' : 'Profile updated successfully!');
        setTimeout(() => this.successMsg.set(null), 3000);
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMsg.set(this.langService.currentLang() === 'ar' ? 'فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.' : 'Failed to update profile. Please try again.');
      }
    });
  }
}