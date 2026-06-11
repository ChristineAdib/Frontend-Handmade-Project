import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Value {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-values',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './values.html',
  styleUrls: ['./values.css']
})
export class ValuesComponent {
  values: Value[] = [
    {
      icon: 'heart',
      title: 'Handcrafted with Love',
      description: 'Every piece tells a story — made by skilled Egyptian hands.'
    },
    {
      icon: 'bamboo',
      title: 'Natural & Sustainable',
      description: 'From Nile clay to palm leaves — honoring the earth in every creation.'
    },
    {
      icon: 'basket',
      title: 'Empowering Artisans',
      description: 'Your purchase supports real people and keeps ancient traditions alive.'
    }
  ];
}