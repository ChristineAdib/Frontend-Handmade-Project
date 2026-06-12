import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  protected readonly langService = inject(LanguageService);
  private readonly toastr = inject(ToastrService);

  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  isSubmitting = signal(false);

  onSubmit(form: any) {
    if (form.invalid) {
      const errorMsg = this.langService.currentLang() === 'ar' 
        ? 'يرجى ملء جميع الحقول المطلوبة بشكل صحيح.' 
        : 'Please fill out all required fields correctly.';
      this.toastr.error(errorMsg, '');
      return;
    }

    this.isSubmitting.set(true);

    // Simulate backend API call
    setTimeout(() => {
      this.isSubmitting.set(false);
      
      const successMsg = this.langService.translate('messageSentSuccess');
      this.toastr.success(successMsg, '');
      
      // Reset form
      this.contactForm = {
        name: '',
        email: '',
        subject: '',
        message: ''
      };
      form.resetForm();
    }, 1500);
  }
}
