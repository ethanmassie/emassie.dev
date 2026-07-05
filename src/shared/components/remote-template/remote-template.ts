import { html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import DOMPurify from 'dompurify';
import { Task } from '@lit/task';

@customElement('em-remote-template')
export class RemoteTemplateElement extends LitElement {
  @property({ type: String })
  src?: string;

  @state() template?: string;

  private _task = new Task(this, {
    task: async ([src]) => {
      if (!src) {
        return nothing;
      }

      const resp = await fetch(src);
      if (!resp.ok) {
        throw new Error(resp.statusText);
      }

      const txt = await resp.text();
      return DOMPurify.sanitize(txt, { ADD_ATTR: ['target'] });
    },
    args: () => [this.src],
  });

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.role = 'presentation';
    this.style.display = 'contents';
  }

  protected render(): unknown {
    return this._task.render({
      pending: () => html`
        Loading...
      `,
      complete: (template) => unsafeHTML(template),
      error: () => html`
        <p role="alert">Failed to load template</p>
      `,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'em-remote-template': RemoteTemplateElement;
  }
}
