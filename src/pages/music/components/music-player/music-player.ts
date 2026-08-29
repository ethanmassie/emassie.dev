import { mdiPlay } from '@mdi/js';
import {
  html,
  LitElement,
  nothing,
  unsafeCSS,
  type PropertyValues,
  type TemplateResult,
} from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { map } from 'lit/directives/map.js';
import styles from './music-player.scss?inline';
import baseStyles from '../../../../shared/styles/base-styles';

export type MusicPlayerTrack = {
  id: string;
  title: string;
  artist: string;
  src: string;
};

@customElement('em-music-player')
export class MusicPlayerElement extends LitElement {
  static styles = [unsafeCSS(styles), baseStyles];

  @property({ type: Array })
  tracks: MusicPlayerTrack[] = [];

  @state() private _currentTrack?: MusicPlayerTrack;

  private get _nextTrack(): MusicPlayerTrack | undefined {
    if (!this._currentTrack) {
      return undefined;
    }

    const currentIndex = this.tracks.indexOf(this._currentTrack);
    if (currentIndex === -1) {
      return undefined;
    }

    return this.tracks[currentIndex + 1] || this._currentTrack;
  }

  @query('#audio-element')
  private _audioEl!: HTMLAudioElement;

  protected render(): TemplateResult {
    return html`
      <table class="em-music-player--tracks-table">
        <thead>
          <tr>
            <td>Title</td>
            <td>Artist</td>
            <td
              class="em-music-player--play-column"
              aria-label="Play"
            ></td>
          </tr>
        </thead>
        <tbody>
          ${map(
            this.tracks,
            (track) => html`
              <tr>
                <td>${track.title}</td>
                <td>${track.artist}</td>
                <td>
                  <button
                    aria-label="Play"
                    @click=${() => this._playTrack(track)}
                  >
                    <em-icon path=${mdiPlay}></em-icon>
                  </button>
                </td>
              </tr>
            `,
          )}
        </tbody>
      </table>

      <div
        class="em-music-player--audio-player"
        hidden=${ifDefined(this._currentTrack ? nothing : true)}
      >
        <div class="em-music-player--now-playing">
          ${this._currentTrack?.title} by ${this._currentTrack?.artist}
        </div>
        <audio
          id="audio-element"
          class="em-music-player--audio-element"
          controls
          src="${this._currentTrack?.src}"
          @ended=${this._playNextTrack.bind(this)}
        ></audio>
      </div>
    `;
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('_currentTrack')) {
      this._audioEl.play();
    }
  }

  private _playTrack(track: MusicPlayerTrack) {
    if (track === this._currentTrack) {
      this._audioEl.currentTime = 0;
      this._audioEl.play();
      return;
    }

    this._currentTrack = track;
  }

  private _playNextTrack() {
    if (!this._currentTrack) {
      return;
    }

    this._currentTrack = this._nextTrack;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'em-music-player': MusicPlayerElement;
  }
}
