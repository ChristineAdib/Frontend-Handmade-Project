import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
})
export class Login {

  submittedUser: any = null;

  // Form 
  loginForm = new FormGroup({

    Email: new FormControl('', [
      Validators.required,
      Validators.email,
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
    ]),

    Password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),

  });

  // Helper 
  hasError(controlName: string, error: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control?.touched && control?.hasError(error));
  }

  // Submit
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.submittedUser = this.loginForm.value;
    this.loginForm.reset();
  }

  // Reset 
  onReset(): void {
    this.loginForm.reset();
    this.submittedUser = null;
  }

}