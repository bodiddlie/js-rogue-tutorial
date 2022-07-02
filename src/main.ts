import * as ROT from 'rot-js';

class Engine {
  public static readonly WIDTH = 80;
  public static readonly HEIGHT = 50;

  display: ROT.Display;

  constructor() {
    this.display = new ROT.Display({width: Engine.WIDTH, height: Engine.HEIGHT});
    const container = this.display.getContainer()!;
    document.body.appendChild(container);
    this.render();
  }

  render() {
    const x = Engine.WIDTH / 2;
    const y = Engine.HEIGHT / 2;
    this.display.draw(x, y, 'Hello World', '#fff', '#000');
  }
}

declare global {
  interface Window {
    engine: Engine
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const engine = new Engine();
  window.engine = engine;
})