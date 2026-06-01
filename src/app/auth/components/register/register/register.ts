import { Component, inject } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private router = inject(Router);

  // بيانات المستخدم بعد التسجيل
  submittedUser: any = null;


  registerForm = new FormGroup({

    FullName: new FormControl('', [Validators.required, Validators.minLength(5)]),

    Email: new FormControl('', [
      Validators.required, 
      Validators.email, 
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
    ]),


    Mobiles: new FormArray([new FormControl('',[
        Validators.required, 
        Validators.pattern('^01[0125][0-9]{8}$')
      ])
    ]),


    Password: new FormControl('', [
      Validators.required,
      Validators.minLength(6)
    ]),

    ConfirmPassword: new FormControl('', [Validators.required]),
  },
  {
    validators: this.passwordMatchValidator
  });

  
  
  
  
  // Custom Validation - Password Match
  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('Password');
    const confirm  = control.get('ConfirmPassword');
    
    if (!password || !confirm) return null;

    if(password.value !== confirm.value){
      confirm.setErrors({mismatch: true});
    }else{
      //امسح ال error لو الباسورد بقا زى بعض
      const errors = {...confirm.errors};
      delete errors['mismatch'];
      confirm.setErrors(Object.keys(errors).length ? errors : null);
    }
    return null;
  }
  
    
  get Mobiles(): FormArray {
    return this.registerForm.get('Mobiles') as FormArray;
  }

  addMobile(): void {
    this.Mobiles.push(
      new FormControl('', [
        Validators.required,
        Validators.pattern('^01[0125][0-9]{8}$')
      ])
    );
  }

  removeMobile(index: number): void {
    this.Mobiles.removeAt(index);
  }


  // Helper لقراءة ال Errors 
  hasError(controlName: string, error: string): boolean{
    const control = this.registerForm.get(controlName);
    return !!(control?.touched && control?.hasError(error));
  }

  hasMobileError(index: number, error: string): boolean{
    const control = this.Mobiles.at(index);
    return !!(control?.touched && control?.hasError(error));
  }



  //Submit
  onSubmit(): void{
    if(this.registerForm.invalid){
      this.registerForm.markAllAsTouched();
      return;
    }
    this.submittedUser = this.registerForm.value;
    this.registerForm.reset();
  }


  
  onReset(): void{
    this.registerForm.reset();
    this.submittedUser = null;
  } 



}




//   registerForm!: FormGroup;


//   // custome validators (search)
//   constructor(){
//     this.registerForm = new FormGroup({
//       FullName: new FormControl('', [Validators.required, Validators.minLength(5)]),
//       password: new FormControl('', [Validators.required, Validators.minLength(5)])   

//     });
//   }
// //  search in single component 
// //  and the product in child component                                                                 

//   register(){
//     console.log(this.registerForm.getRawValue);
//   }


//   get username(){
//     return this.registerForm.get('username');
//   }


//   get password(){
//     return this.registerForm.get('password');
//   }

// 