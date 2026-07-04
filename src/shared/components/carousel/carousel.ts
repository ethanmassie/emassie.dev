import { html, LitElement, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import '../icon';
import styles from './carousel.scss?inline';
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';

@customElement('em-carousel')
export class CarouselElement extends LitElement {
  static styles = [unsafeCSS(styles)];

  @property() scrollBehavior: 'next-overflowing' | 'next' = 'next-overflowing';

  @state() items: HTMLElement[] = [];

  @state() scrolledToItem?: HTMLElement;

  @query('#scroll-area', true) scrollArea!: HTMLDivElement;

  protected render(): unknown {
    return html`
      <button
        class="carousel-scroll-btn left"
        aria-label="Scroll left"
        @click=${this._scrollLeft.bind(this)}
      >
        <em-icon path=${mdiChevronLeft}></em-icon>
      </button>
      <div
        id="scroll-area"
        class="carousel-scroll-area"
      >
        <slot @slotchange=${this._handleSlotChange.bind(this)}></slot>
      </div>
      <button
        class="carousel-scroll-btn right"
        aria-label="Scroll right"
        @click=${this._scrollRight.bind(this)}
      >
        <em-icon path=${mdiChevronRight}></em-icon>
      </button>
    `;
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('scrolledToItem') && this.scrolledToItem) {
      const itemIndex = this.items.indexOf(this.scrolledToItem);
      if (itemIndex === 0) {
        this.scrollArea.scroll(0, 0);
      } else if (itemIndex === this.items.length - 1) {
        this.scrollArea.scrollTo(this.scrollArea.scrollWidth, 0);
      } else {
        const previousItemIndex = this.items.indexOf(
          changedProperties.get('scrolledToItem'),
        );
        this.scrolledToItem.scrollIntoView({
          inline: itemIndex >= previousItemIndex ? 'start' : 'end',
          behavior: 'smooth',
        });
      }
    }
  }

  private _handleSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this.items = slot.assignedElements() as HTMLElement[];

    if (!this.scrolledToItem || !this.items.includes(this.scrolledToItem)) {
      this.scrolledToItem = this.items[0];
    }
  }

  private _scrollLeft() {
    this.scrolledToItem = this._findScrollToItem('left');
  }

  private _scrollRight() {
    this.scrolledToItem = this._findScrollToItem('right');
  }

  private _findScrollToItem(side: 'left' | 'right') {
    switch (this.scrollBehavior) {
      case 'next-overflowing':
        return this._findNextOverflowingItem(side);
      case 'next':
      default:
        return this._findNextItem(side);
    }
  }

  private _findNextOverflowingItem(side: 'left' | 'right') {
    const scrollAreaRect = this.scrollArea.getBoundingClientRect();
    console.log(scrollAreaRect);
    const _items = side === 'left' ? this.items.toReversed() : this.items;

    const closest = _items.find((item) => {
      const itemRect = item.getBoundingClientRect();
      if (side === 'left') {
        console.log(itemRect.left);
        return itemRect.left <= scrollAreaRect.left;
      } else {
        return itemRect.right >= scrollAreaRect.right;
      }
    });
    return (
      closest || (side === 'left' ? this.items[0] : this.items.slice(-1)[0])
    );
  }

  private _findNextItem(side: 'left' | 'right') {
    const currIndex = this.items.indexOf(this.scrolledToItem as HTMLElement);
    const nextIndex = side === 'left' ? currIndex - 1 : currIndex + 1;

    return this.items[nextIndex] || this.scrolledToItem;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'em-carousel': CarouselElement;
  }
}
