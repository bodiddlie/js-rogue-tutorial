import { spawnPlayer } from './entity';
import { Engine } from './engine';

declare global {
  interface Window {
    engine: Engine;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.engine = new Engine(spawnPlayer(Engine.WIDTH / 2, Engine.HEIGHT / 2));
});
