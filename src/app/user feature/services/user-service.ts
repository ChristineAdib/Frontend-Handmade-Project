import { Injectable } from '@angular/core';
import { Iuser } from '../../models/iuser';

@Injectable({
  providedIn: 'root', //root => (singleton DP) means that he have one instance in the whole app
})


export class UserService {
   MyUser: Iuser = {
    Name: 'Steven Ayman Salah',
    Email: 'steven@gmail.com',
    Image: 'steven.png',
    CreditCard: '1234567890123456'
  };


  getUserInfo(): Iuser {
    return this.MyUser;
  }





































  // private currentUser = {
  //   name: 'John Doe',
  //   email: "",
  //   isLoggedIn: false
  // }

  // public getUserInfo(){
  //   return this.currentUser;
  // }


  // login(name: string, email:string){
  //   this.currentUser = {
  //     name, 
  //     email,
  //     isLoggedIn: true
  //   }
  // }

  // logout() {
  //   this.currentUser = {
  //     name: 'Guest',
  //     email: "",
  //     isLoggedIn: false
  //   }
  // }
}



// const user = new UserService();

// user.getUserInfo();
// user.login('Steven', 'steven@gmail.com');