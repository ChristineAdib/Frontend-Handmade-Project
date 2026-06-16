import { Component, inject } from '@angular/core';
import { Iuser } from '../../../models/iuser';
import { DatePipe, UpperCasePipe, TitleCasePipe} from '@angular/common'; 
import { CreditCardPipe } from '../../../core/pipes/credit-card-pipe';
import { UserService } from '../../services/user-service';


@Component({
  selector: 'app-profile',
  imports: [DatePipe, UpperCasePipe, TitleCasePipe, CreditCardPipe],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})


export class Profile {

  private UserService = inject(UserService);

  Today: Date = new Date();
  //عشان اخفى الرقم
  hideCard: boolean = false;


  get MyUser(): Iuser{
    return this.UserService.getUserInfo();
  }

}
