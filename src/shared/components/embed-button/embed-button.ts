import { mdiXml } from '@mdi/js';
import { css, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import baseStyles from '../../styles/base-styles';

@customElement('em-embed-button')
export class EmbedButtonElement extends LitElement {
  static styles = [
    css`
      :host {
        position: relative;
      }

      .copy-notification {
        color: transparent;
        background: transparent;
        position: absolute;
        top: -25px;
        z-index: -1;
        transition: top ease-in 0.25s;
        height: 24px;
        padding: var(--em-spacing-m);
        border-radius: var(--em-border-radius-m);
      }

      .copy-notification.show {
        z-index: 0;
        background: var(--em-level-2-background);
        color: var(--em-level-2-contrast);
        display: block;
        top: -50px;
      }
    `,
    baseStyles,
  ];

  @property({ type: String })
  iframeSelector?: string;

  private _srcOverride?: string;

  @property({ type: String })
  get embedSrc() {
    if (this._srcOverride) {
      return this._srcOverride;
    }

    if (this.iframeSelector) {
      const iframe = document.querySelector(
        this.iframeSelector,
      ) as HTMLIFrameElement;

      return iframe?.src || '';
    }

    return '';
  }

  set embedSrc(src: string) {
    this._srcOverride = src;
  }

  @query('#copy-notification', true)
  copyNotification!: HTMLSpanElement;

  protected render(): unknown {
    return html`
      <button
        @click=${() => {
          const snippet = this._createEmbedSnippet();
          navigator.clipboard.writeText(snippet);
          this.copyNotification.classList.add('show');
          setTimeout(() => {
            this.copyNotification.classList.remove('show');
          }, 1000);
        }}
      >
        Embed
        <em-icon path=${mdiXml}></em-icon>
      </button>
      <span
        id="copy-notification"
        class="copy-notification"
      >
        Copied!
      </span>
    `;
  }

  private _createEmbedSnippet(): string {
    return `<iframe src="${this.embedSrc}"></iframe>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'em-embed-button': EmbedButtonElement;
  }
}
