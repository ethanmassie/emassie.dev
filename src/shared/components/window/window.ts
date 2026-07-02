import { mdiClose, mdiWindowMaximize, mdiWindowMinimize } from '@mdi/js';
import { html, LitElement, nothing, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './window.scss?inline';
import type { WindowedApp } from './window.types';

@customElement('em-window')
export class GdGameElement extends LitElement {
  static styles = unsafeCSS(styles);

  @property({ type: Object }) app?: WindowedApp;

  protected render(): TemplateResult | typeof nothing {
    if (!this.app) {
      return nothing;
    }

    return html`
      <div
        id="header"
        class="header"
      >
        <div class="header--start">
          <img
            class="header--icon"
            src=${this.app.iconSrc}
          />
          <h2 class="header--title">${this.app.title}</h2>
        </div>
        <div class="header--end">
          <button
            aria-label="Toggle maximized window"
            class="header--btn header--max-btn"
            @click=${() => {
              this.classList.toggle('em-window-maximized');
            }}
          >
            <svg
              class="header--max-btn-grow-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d=${mdiWindowMaximize}></path>
            </svg>
            <svg
              class="header--max-btn-shrink-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d=${mdiWindowMinimize}></path>
            </svg>
          </button>
          <button
            aria-label="Close"
            class="header--btn header--close-btn"
            @click=${() => {
              history.back();
            }}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d=${mdiClose}></path>
            </svg>
          </button>
        </div>
      </div>

      <slot id="outlet"></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'em-window': GdGameElement;
  }
}
