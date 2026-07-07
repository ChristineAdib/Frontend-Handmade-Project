import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, ViewChild, ElementRef, inject, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../core/services/language.service';
import '@google/model-viewer';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

@Component({
  selector: 'app-model-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './model-viewer.html',
  styleUrl: './model-viewer.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ModelViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() glbUrl!: string;
  @Input() modelTitle: string = '3D Model';
  @Output() close = new EventEmitter<void>();
  @ViewChild('modelViewerContainer') modelViewerContainer!: ElementRef;
  
  protected langService = inject(LanguageService);
  
  isLoading = true;
  modelError = false;
  isFullscreen = false;
  autoRotate = true;
  showAr = true;

  ngOnInit() {
    if (!this.glbUrl) {
      this.modelError = true;
      this.isLoading = false;
    }
  }

  ngAfterViewInit() {
    // Attempt to launch AR immediately while user click gesture is active
    this.launchAr();

    // Fallback delayed trigger in case initialization takes a moment
    setTimeout(() => {
      this.launchAr();
    }, 150);
  }

  ngOnDestroy() {
    this.exitFullscreen();
  }

  onClose() {
    this.exitFullscreen();
    this.close.emit();
  }

  onModelLoad() {
    this.isLoading = false;
  }

  onModelError() {
    this.modelError = true;
    this.isLoading = false;
    console.error('Error loading 3D model:', this.glbUrl);
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
    const modelViewer = this.modelViewerContainer?.nativeElement?.querySelector('model-viewer');
    if (modelViewer) {
      modelViewer.autoRotate = this.autoRotate;
    }
  }

  toggleFullscreen() {
    const container = this.modelViewerContainer?.nativeElement;
    if (!this.isFullscreen) {
      if (container?.requestFullscreen) {
        container.requestFullscreen().catch((err: any) => console.error('Error entering fullscreen:', err));
        this.isFullscreen = true;
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err: any) => console.error('Error exiting fullscreen:', err));
      }
      this.isFullscreen = false;
    }
  }

  exitFullscreen() {
    if (this.isFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      this.isFullscreen = false;
    }
  }

  downloadModel() {
    const link = document.createElement('a');
    link.href = this.glbUrl;
    link.download = `${this.modelTitle}.glb`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  launchAr() {
    const modelViewer = this.modelViewerContainer?.nativeElement?.querySelector('model-viewer');
    if (modelViewer && modelViewer.activateAR) {
      modelViewer.activateAR();
    }
  }
}
