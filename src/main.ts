import { Entity } from './entity';
import { Engine } from './engine';

declare global {
  interface Window {
    engine: Engine;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const npc = new Entity(Engine.WIDTH / 2 - 5, Engine.HEIGHT / 2, '@', '#ff0');
  const player = new Entity(Engine.WIDTH / 2, Engine.HEIGHT / 2, '@');
  const entities = [npc, player];
  window.engine = new Engine(entities, player);
});
