import { Component, Input, Output, EventEmitter, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-ar-view-modal',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './ar-view-modal.component.html',
  styleUrl: './ar-view-modal.component.css'
})
export class ArViewModalComponent implements OnInit {
  public langService = inject(LanguageService);

  @Input() glbUrl: string = '';
  @Input() productTitle: string = '';
  @Output() close = new EventEmitter<void>();

  isMobile: boolean = false;
  qrCodeUrl: string = '';

  ngOnInit() {
    // Detect mobile device
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (window.innerWidth <= 768);

    // Generate QR Code URL referencing the current product detail page
    const currentUrl = window.location.href;
    this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}`;
  }

  onClose() {
    this.close.emit();
  }
}
