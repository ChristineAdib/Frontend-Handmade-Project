// import { Component, signal } from '@angular/core';
// import { RouterLink } from '@angular/router';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-features-section',
//   standalone: true,
//   imports: [RouterLink, CommonModule],
//   templateUrl: './features-section.html',  // ✅ صح (بدون .component)
//   styleUrl: './features-section.css'         // ✅ صح (بدون .component)
// })
// export class FeaturesSectionComponent {
//   // ... باقي الكود

//   // Customization Preview
//   selectedColor = signal('red');
//   selectedPattern = signal('solid');
//   selectedSize = signal('medium');

//   colors = [
//     { name: 'Red', value: 'red', hex: '#C44536' },
//     { name: 'Green', value: 'green', hex: '#5D8A66' },
//     { name: 'Blue', value: 'blue', hex: '#4A6FA5' },
//     { name: 'Gold', value: 'gold', hex: '#C8813A' },
//   ];

//   patterns = [
//     { name: 'Solid', value: 'solid' },
//     { name: 'Striped', value: 'striped' },
//     { name: 'Checkered', value: 'checkered' },
//   ];

//   sizes = [
//     { name: 'Small', value: 'small' },
//     { name: 'Medium', value: 'medium' },
//     { name: 'Large', value: 'large' },
//   ];

//   getPreviewStyle() {
//     return {
//       'background-color': this.colors.find(c => c.value === this.selectedColor())?.hex || '#C44536',
//       'transform': `scale(${this.selectedSize() === 'small' ? 0.8 : this.selectedSize() === 'large' ? 1.2 : 1})`,
//     };
//   }
// }