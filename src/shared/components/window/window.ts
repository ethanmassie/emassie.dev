import { mdiClose, mdiWindowMaximize, mdiWindowMinimize } from '@mdi/js';
import { html, LitElement, nothing, unsafeCSS, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from './window.scss?inline';
import '../icon';
import baseStyles from '../../styles/base-styles';
import { when } from 'lit/directives/when.js';

@customElement('em-window')
export class WindowElement extends LitElement {
  static styles = [unsafeCSS(styles), baseStyles];

  @property({ type: String }) iconSrc?: string;

  @property({ type: String }) appTitle?: string;

  protected render(): TemplateResult | typeof nothing {
    return html`
      <div
        id="header"
        class="header"
      >
        <div class="header--start">
          <slot name="icon">
            ${when(
              this.iconSrc,
              () => html`
                <img
                  class="header--icon"
                  src="${this.iconSrc}"
                />
              `,
            )}
          </slot>
          <slot name="title">
            ${when(
              this.appTitle,
              () => html`
                <h2 class="header--title">${this.appTitle}</h2>
              `,
            )}
          </slot>
        </div>
        <div class="header--end">
          <button
            aria-label="Toggle maximized window"
            class="header--btn header--max-btn"
            @click=${() => {
              this.classList.toggle('em-window-maximized');
            }}
          >
            <em-icon
              class="header--max-btn-grow-icon"
              path=${mdiWindowMaximize}
            ></em-icon>
            <em-icon
              class="header--max-btn-shrink-icon"
              path=${mdiWindowMinimize}
            ></em-icon>
          </button>
          <button
            aria-label="Close"
            class="header--btn header--close-btn"
            @click=${() => {
              history.back();
            }}
          >
            <em-icon path=${mdiClose}></em-icon>
          </button>
        </div>
      </div>
      <slot id="outlet"></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'em-window': WindowElement;
  }
}
