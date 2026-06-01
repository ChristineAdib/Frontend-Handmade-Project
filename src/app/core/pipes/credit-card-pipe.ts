import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'creditCard'
})
export class CreditCardPipe implements PipeTransform {

  transform(value: string, hideDigits: boolean = false): string {
    if(hideDigits){
      const lastFour = value.slice(-4);
      return `**** - **** - **** - ${lastFour}`;
    }

    const part1 = value.slice(0, 4);
    const part2 = value.slice(4, 8);
    const part3 = value.slice(8, 12);
    const part4 = value.slice(12, 16);
    return `${part1} - ${part2} - ${part3} - ${part4}`; 
  }

}
