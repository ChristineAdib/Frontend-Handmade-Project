import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

interface Review {
  rating: number;
  comment: string;
  userName: string;
  isVerified: boolean;
}

@Component({
  selector: 'app-reviews',
  standalone: true,  // ← دي كانت ناقصة!
  imports: [CommonModule],
  templateUrl: './reviews.html',  // ← غيرت الاسم للملف اللي عندك
  styleUrl: './reviews.css',      // ← غيرت الاسم للملف اللي عندك
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
  currentIndex: number = 0;

  reviews: Review[] = [
    {
      rating: 5,
      comment: 'With just a few pages I was already making great baskets as a beginner! Really clear easy instructions and where to find the right materials!',
      userName: 'John Evan',
      isVerified: true
    },
    {
      rating: 5,
      comment: 'The pottery vase I ordered is absolutely stunning. You can feel the love and skill in every detail — it looks like a piece of art in my home.',
      userName: 'Nour Ahmed',
      isVerified: true
    },
    {
      rating: 5,
      comment: 'I bought a beaded bracelet as a gift and my friend was speechless. The colors are vibrant and the quality is far better than anything I found in stores.',
      userName: 'Sara Mohamed',
      isVerified: true
    },
    {
      rating: 5,
      comment: 'The crochet bag arrived beautifully wrapped. Every stitch is perfect — this is what real handmade craftsmanship looks like. Will order again!',
      userName: 'Layla Karim',
      isVerified: true
    },
    {
      rating: 4,
      comment: 'Ordered a ceramic bowl set and it exceeded my expectations. Fast shipping and the pieces were carefully packed. Highly recommend this shop!',
      userName: 'Ahmed Reda',
      isVerified: true
    },
    {
      rating: 5,
      comment: 'The handmade beaded necklace is even more beautiful in person. Unique, elegant, and made with so much care. This platform is a hidden gem.',
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