import { html, LitElement, unsafeCSS, render } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import styles from './terminal.scss?inline';
import { findFile } from './internal/filesystem';
import { makeFS } from './internal/default-fs';

@customElement('em-terminal')
export class TerminalElement extends LitElement {
  static styles = [unsafeCSS(styles)];

  private _fs = makeFS();

  @query('#output') outputEl!: HTMLDivElement;

  protected render(): unknown {
    return html`
      <div
        id="output"
        class="terminal--output"
      ></div>
      <label class="terminal--input">
        <span class="terminal--input-label">></span>
        <input
          class="terminal--input-field"
          @keydown=${this._handleKey.bind(this)}
        />
      </label>
    `;
  }

  clear() {
    this.outputEl.innerHTML = '';
  }

  printLn(str: string) {
    const lineEl = document.createElement('p');
    lineEl.innerText = str;
    this._appendOutput(lineEl);
  }

  printRichText(renderable: unknown) {
    const target = document.createElement('div');
    target.style.display = 'contents';
    render(renderable, target);
    this._appendOutput(target);
  }

  private _appendOutput(el: Element) {
    this.outputEl.append(el);
    this._scrollToBottom();
  }

  private _scrollToBottom() {
    this.scrollTo(0, this.scrollHeight);
  }

  private _handleKey(e: KeyboardEvent) {
    const input = e.target as HTMLInputElement;
    if (e.key == 'Enter') {
      e.preventDefault();
      this._processInput(input.value);
      input.value = '';
    }
  }

  private _processInput(inputValue: string) {
    this.printLn(`> ${inputValue}`);
    const parts = inputValue.split(' ');
    const command = parts[0];
    const args = parts.slice(1);

    const executable = findFile(this._fs, command, 'exec', true);
    if (!executable) {
      this.printLn('No such file or directory');
      return;
    }

    executable.exec(this, this._fs, args);
  }
}
