import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, translations } from '../../core/services/language.service';

interface Value {
  icon: string;
  titleKey: keyof typeof translations.en;
  descKey: keyof typeof translations.en;
}

@Component({
  selector: 'app-values',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './values.html',
  styleUrls: ['./values.css']
})
export class ValuesComponent {
  protected readonly langService = inject(LanguageService);

  values: Value[] = [
    {
      icon: 'heart',
      titleKey: 'valueTitleLove',
      descKey: 'valueDescLove'
    },
    {
      icon: 'bamboo',
      titleKey: 'valueTitleSust',
      descKey: 'valueDescSust'
    },
    {
      icon: 'basket',
      titleKey: 'valueTitleEmpower',
      descKey: 'valueDescEmpower'
    }
  ];
}