import { html, LitElement, unsafeCSS, render } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import styles from './terminal.scss?inline';
import { findFile, type ExecutableResult } from './internal/filesystem';
import { makeFS } from './internal/default-fs';
import {
  parseTerminalInput,
  type Literal,
  type Token,
} from './internal/parser';

type VariableMap = {
  [key: string]: string | number;
};

@customElement('em-terminal')
export class TerminalElement extends LitElement {
  static styles = [unsafeCSS(styles)];

  private _fs = makeFS();

  @query('#output') outputEl!: HTMLDivElement;

  @query('#input') inputEl!: HTMLInputElement;

  private _commandHistory: string[] = [];
  private _commandHistoryPointer?: number;
  private _commandBackup?: string;
  private _variables: VariableMap = {
    '?': 0,
    HOME: '/home/emassie',
    PATH: '/bin',
  };

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
          required
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

  private _getVar(key: string, tmp?: VariableMap): string | number | undefined {
    return tmp ? tmp[key] || this._variables[key] : this._variables[key];
  }

  private _setVar(key: string, value: string | number) {
    this._variables[key] = value;
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

    let parsedInput: Token[][];
    try {
      parsedInput = parseTerminalInput(inputValue);
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.print(e.message);
      }

      this._setVar('?', 1);
      return;
    }

    const result = this._executeCommand(parsedInput);

    if (!result || !result.msg) {
      return;
    }

    if (result.msg) {
      this.print(result.msg);
    }

    if (!isNaN(result.code)) {
      this._setVar('?', result.code);
    }
  }

  private _executeCommand(parsedInput: Token[][]): ExecutableResult {
    const tmpVars: VariableMap = {};
    return parsedInput.reduce(({ code, msg }, tokens) => {
      if (!isNaN(code) && code !== 0) {
        return { code, msg };
      }

      tokens
        .filter((t) => t.type === 'assignment')
        .forEach((assignment) => {
          tmpVars[assignment.variable] = assignment.value;
        });

      const commandLiteralIndex = tokens.findIndex((t) => t.type === 'literal');
      if (commandLiteralIndex === -1) {
        return { code: 1, msg: 'Invalid command' };
      }
      const commandLiteral = tokens[commandLiteralIndex] as Literal;
      const executable = findFile(this._fs, commandLiteral.value, 'exec', true);
      if (!executable) {
        return { code: 1, msg: 'No such file or directory' };
      }

      const args = tokens
        .slice(commandLiteralIndex + 1)
        // TODO: handle args other than literals
        .filter(
          (token) => token.type === 'literal' || token.type === 'replacement',
        )
        .map((arg) => {
          if (arg.type === 'literal') {
            return arg.value;
          }

          return this._getVar(arg.variable, tmpVars)?.toString() || '';
        });
      if (msg) {
        args.push(msg);
      }

      return executable.exec(this, this._fs, args);
    }, {} as ExecutableResult);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'em-terminal': TerminalElement;
  }
}
