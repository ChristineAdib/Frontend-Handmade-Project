import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../Services/auth';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
// import { AuthService } from '/';

@Component({
  selector: 'app-login-with-api',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login-with-api.html',
  styleUrl: './login-with-api.css',
})  
export class LoginWithApi {
onSubmit() {
throw new Error('Method not implemented.');
} 

  private authService= inject(Auth);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  errorMessage: string = '';
  isLoading: boolean = false;

  // loginForm = new FormGroup({
  //   email: new FormControl<string>('', [Validators.required, Validators.email]),
  //   password: new FormControl<string>('', [Validators.required, Validators.minLength(6)]),
  // });

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });


  get email(){
    return this.loginForm.get('email');
  }
  
  get password() {
    return this.loginForm.get('password');
  }



  login() {
    if (this.loginForm.invalid){
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (res) => {
        this.authService.saveToken(res.access_token);
        this.isLoading = false;
        this.router.navigate(['/products-api']); // غير الـ route حسب بروجكتك
        this.toastr.success('Welcome back!', 'Login Successful');

      },
      error: () => {
        this.toastr.error('Invalid email or password!', 'Login Failed');
        this.isLoading = false;
      }
    });
  }


}


























