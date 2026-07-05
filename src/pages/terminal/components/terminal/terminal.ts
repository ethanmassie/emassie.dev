import { html, LitElement, unsafeCSS, render } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import styles from './terminal.scss?inline';
import { findFile, type ExecutableResult } from './internal/filesystem';
import { makeFS } from './internal/default-fs';

@customElement('em-terminal')
export class TerminalElement extends LitElement {
  static styles = [unsafeCSS(styles)];

  private _fs = makeFS();

  @query('#output') outputEl!: HTMLDivElement;

  @query('#input') inputEl!: HTMLInputElement;

  private _commandHistory: string[] = [];
  private _commandHistoryPointer?: number;
  private _commandBackup?: string;

  protected render(): unknown {
    return html`
      <div
        id="output"
        class="terminal--output"
      ></div>
      <label class="terminal--input">
        <span class="terminal--input-label">></span>
        <input
          id="input"
          autocomplete="off"
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

  print(str: string) {
    const pre = document.createElement('pre');
    pre.innerText = str;
    this._appendOutput(pre);
  }

  printRichText(renderable: unknown) {
    const target = document.createElement('div');
    target.style.display = 'contents';
    render(renderable, target);
    this._appendOutput(target);
  }

  private _clearInput() {
    this.inputEl.value = '';
  }

  private _appendOutput(el: Element) {
    this.outputEl.append(el);
    this._scrollToBottom();
  }

  private _scrollToBottom() {
    this.scrollTo(0, this.scrollHeight);
  }

  private _handleKey(e: KeyboardEvent) {
    switch (e.key) {
      case 'Enter':
        this._processInput(this.inputEl.value);
        this._clearInput();
        break;
      case 'ArrowUp':
        this._stepThroughHistory('up');
        break;
      case 'ArrowDown':
        this._stepThroughHistory('down');
        break;
      default:
        return;
    }
    e.preventDefault();
  }

  private _stepThroughHistory(direction: 'up' | 'down') {
    if (this._commandHistory.length === 0) {
      return;
    }

    if (
      direction === 'down' &&
      this._commandHistoryPointer === this._commandHistory.length - 1
    ) {
      this.inputEl.value = this._commandBackup || '';
      return;
    }

    if (this._commandHistoryPointer === undefined) {
      if (direction === 'up') {
        this._commandBackup = this.inputEl.value;
        this._commandHistoryPointer = this._commandHistory.length - 1;
      } else {
        return;
      }
    } else {
      const delta = direction === 'up' ? -1 : 1;
      this._commandHistoryPointer = Math.min(
        Math.max(0, this._commandHistoryPointer + delta),
        this._commandHistory.length - 1,
      );
    }

    const historyValue =
      this._commandHistory[this._commandHistoryPointer] || '';
    this.inputEl.value = historyValue;
  }

  private _printInput(value: string) {
    this.printRichText(html`
      <span class="printed-cursor">></span>
      ${value}
    `);
  }

  private _processInput(inputValue: string) {
    this._commandHistory.push(inputValue);
    this._commandHistoryPointer = undefined;
    this._printInput(inputValue);

    const result = inputValue.split('|').reduce(({ code, msg }, input) => {
      const parts = input.trim().split(' ');
      const command = parts[0];
      const args = parts.slice(1);

      if (!isNaN(code) && code !== 0) {
        return { code, msg };
      }

      if (msg) {
        args.push(msg);
      }

      const executable = findFile(this._fs, command, 'exec', true);
      if (!executable) {
        return { code: 1, msg: 'No such file or directory' };
      }

      return executable.exec(this, this._fs, args);
    }, {} as ExecutableResult);

    if (!result || !result.msg) {
      return;
    }

    if (result.msg) {
      this.print(result.msg);
    }
  }
}
