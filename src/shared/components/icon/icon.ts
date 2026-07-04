import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('em-icon')
export class IconElement extends LitElement {
  static styles = css`
    :host {
      --_size: var(--em-icon-size, 24px);
      height: var(--_size);
      width: var(--_size);
      font-size: var(--_size);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    svg {
      fill: currentColor;
    }
  `;

  @property({ type: String }) path?: string;

  connectedCallback(): void {
    super.connectedCallback();
    this.ariaHidden = 'true';
  }

  protected render(): unknown {
    return html`
      <svg viewBox="0 0 24 24">
        <path d=${this.path}></path>
      </svg>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'em-icon': IconElement;
  }
}
