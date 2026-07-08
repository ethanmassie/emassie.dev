import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import baseStyles from '../../styles/base-styles';
import { pxStr } from '../../utils';
import styles from './carousel-item.scss?inline';
import { ifDefined } from 'lit/directives/if-defined.js';

const ANIMATION_MS = 500;
const DELAY_MS = 20;

@customElement('em-carousel-img')
export class CarouselImgElement extends LitElement {
  static styles = [unsafeCSS(styles), baseStyles];

  @property({
    type: Boolean,
    useDefault: true,
    reflect: true,
    attribute: 'can-enlarge',
  })
  canEnlarge = false;

  @property({ type: String }) src?: string;

  @property({ type: String }) alt?: string;

  @query('#image', true) imageEl!: HTMLImageElement;

  private _cleanup?: (e?: Event) => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.role = 'listitem';

    this.addEventListener('keydown', (e: KeyboardEvent) => {
      if (
        !this.canEnlarge ||
        (e.key !== 'Enter' && e.key !== ' ') ||
        e.target !== this
      ) {
        return;
      }

      this._enlargeItem();
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    if (this._cleanup) {
      this._cleanup();
    }
  }

  protected render(): unknown {
    return html`
      <div
        class="carousel-item--wrapper"
        role="${this.canEnlarge ? 'button' : 'presentation'}"
        @click=${this.canEnlarge ? this._enlargeItem.bind(this) : () => {}}
      >
        <img
          id="image"
          part="image"
          src=${ifDefined(this.src)}
          alt=${ifDefined(this.alt)}
        />
      </div>
    `;
  }

  private _isEnlarged() {
    return this.shadowRoot?.querySelector('dialog')?.open;
  }

  private _enlargeItem() {
    if (this._isEnlarged()) {
      return;
    }
    const rect = this.imageEl.getBoundingClientRect();
    const clone = this.imageEl.cloneNode() as HTMLImageElement;
    clone.classList.add('carousel-item--clone');

    const modal = document.createElement('dialog');
    modal.ariaLabel = 'Enlarged image';
    modal.classList.add('carousel-item--modal');
    modal.style.setProperty(`--_original-height`, pxStr(rect.height));
    modal.style.setProperty(`--_original-width`, pxStr(rect.width));
    modal.style.setProperty(`--_original-top`, pxStr(rect.top));
    modal.style.setProperty(`--_original-left`, pxStr(rect.left));
    modal.appendChild(clone);

    this._cleanup = (e: Event | undefined) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      modal.classList.remove('full-size');
      clone.classList.remove('full-size');
      // wait for animation to finish
      setTimeout(() => {
        if (modal.open) {
          modal.close();
        }
        modal.remove();
        this._cleanup = undefined;
      }, ANIMATION_MS);
    };

    modal.addEventListener('keydown', (e) => {
      // needed to stop all keys from propagating outside of the modal
      e.preventDefault();
      e.stopPropagation();

      if (this._cleanup && e.key === 'Escape') {
        this._cleanup(e);
      }
    });
    modal.addEventListener('click', (e: Event) => {
      if (e.target === modal && this._cleanup) {
        this._cleanup();
      }
    });

    this.shadowRoot!.append(modal);
    modal.showModal();

    // delay style changes to ensure transitions occur
    setTimeout(() => {
      modal.classList.add('full-size');
      clone.classList.add('full-size');
    }, DELAY_MS);

    // determine what the auto width was calculated to be and set it as a custom property so the transition out can animate the width shrinking
    setTimeout(() => {
      modal.style.setProperty('--_auto-width', pxStr(clone.clientWidth));
    }, ANIMATION_MS + DELAY_MS);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'em-carousel-img': CarouselImgElement;
  }
}
