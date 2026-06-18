import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../../services/profile.service';
import { UserProfile } from '../../models/user-profile';
import { LanguageService } from '../../../core/services/language.service';
import { AuthService } from '../../../auth/Services/auth';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  private readonly profileService = inject(ProfileService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  protected readonly langService = inject(LanguageService);
  private readonly authService = inject(AuthService);

  // Profile data signal
  profile = signal<UserProfile | null>(null);

  // Form Field Signals
  name = signal<string>('');
  phoneNumber = signal<string>('');
  bio = signal<string>('');
  
  // Image Upload State
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  // Loading State
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  ngOnInit(): void {
    this.loadProfileData();
  }

  loadProfileData(): void {
    this.isLoading.set(true);
    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.profile.set(res);
        this.name.set(res.name || '');
        this.phoneNumber.set(res.phoneNumber || '');
        this.bio.set(res.bio || '');
        this.imagePreview.set(res.profileImage || null);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load profile details', err);
        this.isLoading.set(false);
        this.toastr.error('Failed to load user profile for editing.');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.toastr.error('Please select a valid image file.');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.toastr.error('Image size must be less than 2MB.');
        return;
      }

      this.selectedFile.set(file);

      // Create local image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    const currentProfile = this.profile();
    if (!currentProfile) {
      this.toastr.error('No profile loaded to update.');
      return;
    }

    if (!this.name().trim()) {
      this.toastr.error('Name cannot be empty.');
      return;
    }

    this.isSaving.set(true);

    // Build Multipart Form Data
    const formData = new FormData();
    formData.append('Name', this.name().trim());
    formData.append('PhoneNumber', this.phoneNumber().trim());
    formData.append('Bio', this.bio().trim());

    const file = this.selectedFile();
    if (file) {
      formData.append('ProfileImage', file, file.name);
    }

    this.profileService.updateProfile(currentProfile.id, formData).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.toastr.success('Profile updated successfully.');
        
        // Sync the updated profile info to the auth session in localStorage
        const authUser = this.authService.getUser();
        if (authUser && res.data) {
          authUser.name = res.data.name;
          authUser.profileImage = res.data.profileImage;
          this.authService.updateSession(authUser);
        }

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Failed to update profile', err);
        this.isSaving.set(false);
        this.toastr.error(err.error?.message || 'Failed to update profile. Please try again.');
      }
    });
  }
}
