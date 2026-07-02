import { mdiClose, mdiWindowMaximize, mdiWindowMinimize } from '@mdi/js';
import { html, LitElement, nothing, unsafeCSS, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import styles from './gd-game.scss?inline';
import type { GdGame } from "./gd-game.types";

@customElement('em-gd-game')
export class GdGameElement extends LitElement {

  static styles = unsafeCSS(styles);

  @property({ type: Object }) game?: GdGame

  protected render(): TemplateResult | typeof nothing {
    if (!this.game) {
      return nothing
    }

    return html`
      <div id="gd-game-window-header" class="gd-game-window--header">
        <div class="gd-game-window--header-start">
          <img class="gd-game-window--icon" src=${this.game.iconSrc} />
          <h2 class="gd-game-window--title">${this.game.title}</h2>
        </div>
        <div class="gd-game-window--header-end">
          <button 
            aria-label="Toggle maximized window"
            class="gd-game-window--header-btn gd-game-window--header-max-btn"
            @click=${() => {
              this.classList.toggle('gd-game-maximized');
            }}>
            <svg 
              class="gd-game-window--header-max-btn-grow-icon" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d=${mdiWindowMaximize}></path>
            </svg>
            <svg 
              class="gd-game-window--header-max-btn-shrink-icon" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d=${mdiWindowMinimize}></path>
            </svg>
          </button>
          <button 
            aria-label="Close"
            class="gd-game-window--header-btn gd-game-window--header-close-btn"
            @click=${() => {
              history.back();
            }}>
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d=${mdiClose}></path>
            </svg>
          </button>
        </div>
      </div>
      <iframe id="gd-game-window-outlet" class="gd-game-window--outlet" src=${this.game.src}></iframe>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'em-gd-game': GdGameElement;
  }
}
