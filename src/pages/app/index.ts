import apps from './apps.json';

const THIS_URL = new URL(location.href);
const APP_ID = THIS_URL.searchParams.get('id');
const MAIN = document.querySelector('main#main-content');

function init() {
  const app = apps.find((g) => g.id === APP_ID);
  if (!app) {
    // handle missing game
    console.error('No app with id', APP_ID);
    location.replace('/');
    return;
  }

  const windowEl = document.createElement('em-window');
  windowEl.app = app;
  // <iframe id="gd-game-window-outlet" class="gd-game-window--outlet" src=${this.game.src}></iframe>
  const iframe = document.createElement('iframe');
  iframe.src = app.src;
  windowEl.appendChild(iframe);
  MAIN?.appendChild(windowEl);

  const title = document.querySelector('head title') as HTMLElement;

  if (title) {
    title.innerText = `emassie.dev | ${app.title}`;
  }
}

init();
