import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-clock',
  imports: [DatePipe],
  templateUrl: './clock.html',
  styleUrl: './clock.css',
})

export class Clock implements OnInit, OnDestroy{
  currentTime: Date = new Date();
  secondsOnPage: number = 0;


  //بنحتفظ بال interval عشان نقدر نوقفه فى ngOnDestroy
  private intervalId: any;

  //بيشتغل لما ال Component يتعمل
  ngOnInit(): void{
    console.log('Clock started!');


    this.intervalId = setInterval(() => {
      this.currentTime = new Date();
      this.secondsOnPage++;

      console.clear();
      console.log(`You've been on this page for ${this.secondsOnPage} seconds`);
    }, 1000);


  }

  //بيشتغل لما ال component يتشال 
  ngOnDestroy(): void {
      clearInterval(this.intervalId);
      console.log(`Clock stopped! - Total time: ${this.secondsOnPage} seconds`);
      
  }


}
