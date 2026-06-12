import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { LanguageService } from '../../core/services/language.service';

interface Review {
  rating: number;
  comment: string;
  commentAr: string;
  userName: string;
  isVerified: boolean;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css',
  animations: [
    trigger('fadeSlide', [
      transition(':increment', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('500ms cubic-bezier(0.23, 1, 0.32, 1)', 
          style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':decrement', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('500ms cubic-bezier(0.23, 1, 0.32, 1)', 
          style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class ReviewsComponent {
  protected readonly langService = inject(LanguageService);
  currentIndex: number = 0;

  reviews: Review[] = [
    {
      rating: 5,
      comment: 'With just a few pages I was already making great baskets as a beginner! Really clear easy instructions and where to find the right materials!',
      commentAr: 'كمبتدئ، تمكنت من صنع سلال رائعة بفضل بضع صفحات فقط! تعليمات واضحة وسهلة للغاية ومعلومات حول مكان العثور على المواد المناسبة!',
      userName: 'John Evan',
      isVerified: true
    },
    {
      rating: 5,
      comment: 'The pottery vase I ordered is absolutely stunning. You can feel the love and skill in every detail — it looks like a piece of art in my home.',
      commentAr: 'المزهرية الفخارية التي طلبتها مذهلة للغاية. يمكنك الشعور بالحب والمهارة في كل تفصيل — تبدو كقطعة فنية في منزلي.',
      userName: 'Nour Ahmed',
      isVerified: true
    },
    {
      rating: 5,
      comment: 'I bought a beaded bracelet as a gift and my friend was speechless. The colors are vibrant and the quality is far better than anything I found in stores.',
      commentAr: 'اشتريت سوارًا من الخرز كهدية وصديقتي لم تجد كلمات للتعبير عن إعجابها. الألوان نابضة بالحياة والجودة أفضل بكثير مما وجدته في المتاجر.',
      userName: 'Sara Mohamed',
      isVerified: true
    },
    {
      rating: 5,
      comment: 'The crochet bag arrived beautifully wrapped. Every stitch is perfect — this is what real handmade craftsmanship looks like. Will order again!',
      commentAr: 'حقيبة الكروشيه وصلت مغلفة بشكل جميل. كل غرزة مثالية — هذا هو مظهر الحرف اليدوية الحقيقية. سأطلب مرة أخرى بالتأكيد!',
      userName: 'Layla Karim',
      isVerified: true
    },
    {
      rating: 4,
      comment: 'Ordered a ceramic bowl set and it exceeded my expectations. Fast shipping and the pieces were carefully packed. Highly recommend this shop!',
      commentAr: 'طلبت طقم أوعية سيراميك وتجاوز توقعاتي. شحن سريع وتم تغليف القطع بعناية فائقة. أوصي بشدة بهذا المتجر!',
      userName: 'Ahmed Reda',
      isVerified: true
    },
    {
      rating: 5,
      comment: 'The handmade beaded necklace is even more beautiful in person. Unique, elegant, and made with so much care. This platform is a hidden gem.',
      commentAr: 'عقد الخرز المصنوع يدويًا أكثر جمالًا في الواقع. فريد وأنيق ومصنوع بعناية فائقة. هذه المنصة جوهرة مخفية.',
      userName: 'Mariam Tarek',
      isVerified: true
    }
  ];

  get currentReview(): Review {
    return this.reviews[this.currentIndex];
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.reviews.length;
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.reviews.length) % this.reviews.length;
  }

  goTo(index: number) {
    this.currentIndex = index;
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}