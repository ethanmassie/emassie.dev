import { GdGameElement } from './gd-game';
import games from './gd-games.json';

const THIS_URL = new URL(location.href);
const GAME_ID = THIS_URL.searchParams.get('id');
const MAIN = document.querySelector('main#main-content');

function init() {
  const game = games.find(g => g.id === GAME_ID);
  if (!game) {
    // handle missing game
    console.error('No game with id', GAME_ID);
    location.replace('/');
    return;
  }

  const gameEl = new GdGameElement();
  gameEl.game = game;
  MAIN?.appendChild(gameEl);
}

init();