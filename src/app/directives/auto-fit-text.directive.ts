import { Directive, ElementRef, AfterViewInit, Renderer2, Input } from '@angular/core';
import { AutofitService } from './auto-fit-text.service';
import { RendererStyleFlags2 } from '@angular/core';

@Directive({
    selector: '[appAutofitText]',
    standalone: true
})


export class AutofitTextDirective implements AfterViewInit {
  @Input() autofitGroup: string = 'default';
  private resizeObserver: ResizeObserver;
  private mutationObserver: MutationObserver;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private autofitService: AutofitService
  ) {}


  ngAfterViewInit() {
    const el = this.el.nativeElement;

    // 1. ResizeObserver: Observe changes in Width/View
    this.resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          this.syncFontSize();
        }
      }
    });
    this.resizeObserver.observe(el);

    // 2. MutationObserver: Observe changes in content
    this.mutationObserver = new MutationObserver(() => {
      this.autofitService.resetGroup(this.autofitGroup);
      this.syncFontSize();
    });

    this.mutationObserver.observe(el, {
      characterData: true,
      childList: true,
      subtree: true
    });
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
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
        this.renderer.setStyle(el, 'font-size', `${fontSize}px`, RendererStyleFlags2.Important);
      }

      this.autofitService.updateMinSize(this.autofitGroup, fontSize);

      this.autofitService.getGroup(this.autofitGroup, initialSize).subscribe(minSize => {
        this.renderer.setStyle(el, 'font-size', `${minSize}px`, RendererStyleFlags2.Important);
      });
    }, 100);
  }

}
