import { Directive, ElementRef, AfterViewInit, Renderer2, Input } from '@angular/core';
import { AutofitService } from './auto-fit-text.service';

@Directive({ 
    selector: '[appAutofitText]',
    standalone: false
})

export class AutofitTextDirective implements AfterViewInit {
  @Input() autofitGroup: string = 'default';
  private observer: ResizeObserver

  constructor(
    private el: ElementRef, 
    private renderer: Renderer2,
    private autofitService: AutofitService
  ) {}

  ngAfterViewInit() {
    const el = this.el.nativeElement;
    this.observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          this.syncFontSize();
          // this.observer.disconnect(); 
        }
      }
    });
    this.observer.observe(el);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private syncFontSize() {
    const el = this.el.nativeElement;
    if (!el || el.offsetWidth === 0) return;

    setTimeout(() => {
      let fontSize = parseFloat(window.getComputedStyle(el).fontSize) || 16;
      const initialSize = fontSize;

      while (el.scrollWidth > el.offsetWidth && fontSize > 8) {
        fontSize -= 0.5;
        this.renderer.setStyle(el, 'font-size', `${fontSize}px`);
      }

      this.autofitService.updateMinSize(this.autofitGroup, fontSize);

      this.autofitService.getGroup(this.autofitGroup, initialSize).subscribe(minSize => {
        this.renderer.setStyle(el, 'font-size', `${minSize}px`);
      });
    }, 100);
  }
}