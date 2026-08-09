import htmx from 'htmx.org';
import { html, LitElement, unsafeCSS, type PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { map } from 'lit/directives/map.js';
import styles from './htmx-tabs.scss?inline';
import baseStyles from '../../styles/base-styles';

export type HtmxTabDefinition = {
  label: string;
  get: string;
  default?: boolean;
};

@customElement('em-htmx-tabs')
export class HtmxTabsElement extends LitElement {
  override shadowRoot!: ShadowRoot;

  static styles = [unsafeCSS(styles), baseStyles];

  @property({ type: Array })
  tabs: HtmxTabDefinition[] = [];

  @state()
  activeTab?: HtmxTabDefinition;

  @query('#tab-list', true)
  tabList!: HTMLElement;

  private _outletElement?: HTMLElement;

  connectedCallback(): void {
    super.connectedCallback();
  }

  protected willUpdate(_changedProperties: PropertyValues): void {
    if (!this.activeTab) {
      this.activeTab = this.tabs.find((t) => t.default) || this.tabs[0];
    }
  }

  protected render() {
    return html`
      <div
        id="tab-list"
        class="em-htmx-tabs--tab-group"
        part="tab-group"
        role="tablist"
        @keydown=${this._handleTablistNav.bind(this)}
      >
        ${map(
          this.tabs,
          (tab, i) => html`
            <button
              class="em-htmx-tabs--tab ${classMap({
                'em-htmx-tabs--active-tab': tab === this.activeTab,
              })}"
              part="tab"
              data-index="${i}"
              role="tab"
              aria-controls
              aria-selected=${tab === this.activeTab ? 'true' : 'false'}
              @click=${this._handleTabClick.bind(this)}
            >
              ${tab.label}
            </button>
          `,
        )}
      </div>
      <div
        id="tab-panel"
        role="tabpanel"
      >
        <slot name="outlet"></slot>
      </div>
    `;
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('activeTab')) {
      this._prepareOutlet();
    }
  }

  private _prepareOutlet() {
    if (!this.activeTab) {
      this._outletElement?.remove();
      return;
    }

    if (!this._outletElement) {
      this._outletElement = document.createElement('div');
      this._outletElement.slot = 'outlet';
    }

    this._outletElement.setAttribute('hx-get', this.activeTab.get);
    this._outletElement.setAttribute('hx-trigger', 'load');
    if (this._outletElement.parentElement === null) {
      this.append(this._outletElement);
    }
    htmx.process(this._outletElement, true);
  }

  private _handleTabClick(event: Event): void {
    const target = event.target as HTMLButtonElement;
    const index = Number(target.getAttribute('data-index') || undefined);
    if (isNaN(index)) {
      return;
    }

    this.activeTab = this.tabs[index];
  }

  private _handleTablistNav(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.role !== 'tab') {
      return;
    }

    let focusTarget: HTMLElement | null = null;
    switch (event.key) {
      case 'ArrowLeft':
        focusTarget =
          (target.previousElementSibling as HTMLElement) ||
          this.tabList.querySelector('[role="tab"]:last-child');
        break;
      case 'ArrowRight':
        focusTarget =
          (target.nextElementSibling as HTMLElement) ||
          this.tabList.querySelector('[role="tab"]:first-child');
        break;
      default:
        return;
    }

    if (focusTarget) {
      event.preventDefault();
      focusTarget.focus();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'em-htmx-tabs': HtmxTabsElement;
  }
}
