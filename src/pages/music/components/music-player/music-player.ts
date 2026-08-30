import { mdiDownload, mdiPlay } from '@mdi/js';
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

  @query('#audio-element', true)
  private _audioEl!: HTMLAudioElement;

  @query('#audio-player', true)
  private _audioPlayerEl!: HTMLDivElement;

  @query('#now-playing', true)
  private _nowPlayingEl!: HTMLDivElement;

  private _resizeObserver = new ResizeObserver(() => {
    this._setupTextScrollingAnimation();
  });

  protected render(): TemplateResult {
    return html`
      <table class="em-music-player--tracks-table">
        <thead>
          <tr>
            <td>Title</td>
            <td>Artist</td>
            <td
              class="em-music-player--btn-column"
              aria-label="Download"
            ></td>
            <td
              class="em-music-player--btn-column"
              aria-label="Play"
            ></td>
          </tr>
        </thead>
        <tbody>
          ${map(
            this.tracks,
            (track) => html`
              <tr>
                <td title=${track.title}>${track.title}</td>
                <td title=${track.artist}>${track.artist}</td>
                <td>
                  <button
                    aria-label="Download"
                    @click=${() => this._downloadTrack(track)}
                  >
                    <em-icon path=${mdiDownload}></em-icon>
                  </button>
                </td>
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
        id="audio-player"
        hidden=${ifDefined(this._currentTrack ? nothing : true)}
      >
        <div
          id="now-playing"
          style="animation: none"
        >
          ${this._currentTrack?.title} by ${this._currentTrack?.artist}
        </div>
        <audio
          id="audio-element"
          controls
          src="${this._currentTrack?.src}"
          @ended=${this._playNextTrack.bind(this)}
        ></audio>
      </div>
    `;
  }

  protected firstUpdated(_changedProperties: PropertyValues): void {
    this._resizeObserver.observe(this._audioPlayerEl);
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('_currentTrack')) {
      this._audioEl.play();
      this._nowPlayingEl.style.animation = '';

      this._setupTextScrollingAnimation();
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

  private _downloadTrack(track: MusicPlayerTrack) {
    const a = document.createElement('a');
    a.href = track.src;
    const fileName = track.src.split('/').slice(-1)[0] || 'recording';
    a.download = fileName;

    a.click();
    a.remove();
  }

  private _setupTextScrollingAnimation() {
    const textOverflowing =
      this._nowPlayingEl.clientWidth >= this._audioPlayerEl.clientWidth;
    this._nowPlayingEl.classList.toggle('animated-scroll', textOverflowing);
    this._nowPlayingEl.style.setProperty(
      '--_width',
      `${this._nowPlayingEl.clientWidth}px`,
    );

    this.style.setProperty(
      '--_controls-height',
      `${this._audioPlayerEl.clientHeight}px`,
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'em-music-player': MusicPlayerElement;
  }
}
