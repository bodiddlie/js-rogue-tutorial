import { Entity } from './entity';
import { Engine } from './engine';

declare global {
  interface Window {
    engine: Engine;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const player = new Entity(Engine.WIDTH / 2, Engine.HEIGHT / 2, '@');
  window.engine = new Engine(player);
});
