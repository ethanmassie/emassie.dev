import { mdiChevronLeft, mdiChevronRight } from '@mdi/js';
import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import baseStyles from '../../styles/base-styles';
import '../icon';
import styles from './carousel.scss?inline';

/**
 * Horizontally scrollable list of items. Uses list semantics so slotted children should have role listitem.
 * If you wrap your slotted items in an em-carousel-item that will automatically set the role.
 * Provides typical list navigation keyboard controls:
 * - left: previous item
 * - right: next item
 * - home: first item
 * - end: last item
 * - page up: previous obscured item or first
 * - page down: next obscured item or last
 */
@customElement('em-carousel')
export class CarouselElement extends LitElement {
  static styles = [unsafeCSS(styles), baseStyles];

  /**
   * changes the behavior of the scroll buttons.
   * "next-overflowing": goes to the next obscured item in either direction
   * "next": goes to the item nearest the current item
   */
  @property() scrollBehavior: 'next-overflowing' | 'next' = 'next-overflowing';

  @query('#scroll-area', true) scrollArea!: HTMLDivElement;

  /** List of slotted items. Automatically set by the slotchange event listener */
  private _items: HTMLElement[] = [];
  /** Current item we are "scrolled to" */
  private _scrolledToItem?: HTMLElement;

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
        role="list"
        tabindex="-1"
      >
        <slot
          @slotchange=${this._handleSlotChange.bind(this)}
          @keydown=${this._handleKeyboardNavigation.bind(this)}
        ></slot>
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

  private _handleSlotChange(e: Event) {
    const slot = e.target as HTMLSlotElement;
    this._items = slot.assignedElements() as HTMLElement[];
    if (this._items.length === 0) {
      return;
    }

    if (!this._scrolledToItem || !this._items.includes(this._scrolledToItem)) {
      this._scrollTo(this._items[0], 'start');
    }

    const focusableElements = this._items.filter((i) => {
      return i.tabIndex === 0;
    });

    if (focusableElements.length === 0) {
      this._items[0].tabIndex = 0;
    } else if (focusableElements.length > 1) {
      focusableElements.slice(1).forEach((el) => (el.tabIndex = -1));
    }
  }

  private _scrollTo(
    item: HTMLElement,
    inline: ScrollLogicalPosition,
    focus = false,
  ) {
    item.scrollIntoView({
      inline,
      behavior: 'smooth',
    });

    this._scrolledToItem = item;
    this._items.forEach((i) => (i.tabIndex = -1));
    this._scrolledToItem.tabIndex = 0;
    if (focus) {
      this._scrolledToItem.focus({ preventScroll: true });
    }
  }

  private _scrollLeft() {
    const item = this._findScrollToItem('left');
    if (item) {
      this._scrollTo(item, 'end');
    }
  }

  private _scrollRight() {
    const item = this._findScrollToItem('right');
    if (item) {
      this._scrollTo(item, 'start');
    }
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
    const _items = side === 'left' ? this._items.toReversed() : this._items;

    const closest = _items.find((item) => {
      const itemRect = item.getBoundingClientRect();
      if (side === 'left') {
        return itemRect.left <= scrollAreaRect.left;
      } else {
        return itemRect.right >= scrollAreaRect.right;
      }
    });
    return (
      closest || (side === 'left' ? this._items[0] : this._items.slice(-1)[0])
    );
  }

  private _findNextItem(side: 'left' | 'right') {
    const currIndex = this._items.indexOf(this._scrolledToItem as HTMLElement);
    const nextIndex = side === 'left' ? currIndex - 1 : currIndex + 1;

    return this._items[nextIndex] || this._scrolledToItem;
  }

  private _handleKeyboardNavigation(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    const itemIndex = this._items.indexOf(target);
    if (itemIndex === -1) {
      return;
    }

    let focusTarget: HTMLElement | undefined = undefined;
    let inline: ScrollLogicalPosition | undefined = undefined;
    switch (e.key) {
      case 'ArrowLeft':
        focusTarget = target.previousElementSibling as HTMLElement;
        inline = 'end';
        break;
      case 'ArrowRight':
        focusTarget = target.nextElementSibling as HTMLElement;
        inline = 'start';
        break;
      case 'Home':
        focusTarget = this._items[0];
        inline = 'start';
        break;
      case 'End':
        focusTarget = this._items.slice(-1)[0];
        inline = 'end';
        break;
      case 'PageDown':
        focusTarget = this._findNextOverflowingItem('left');
        inline = 'end';
        break;
      case 'PageUp':
        focusTarget = this._findNextOverflowingItem('right');
        inline = 'start';
        break;
      default:
        return;
    }
    e.preventDefault();
    e.stopPropagation();

    if (focusTarget) {
      this._scrollTo(focusTarget, inline, true);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'em-carousel': CarouselElement;
  }
}
