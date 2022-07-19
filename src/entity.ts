import { BaseAI, HostileEnemy } from './components/ai';
import { Fighter } from './components/fighter';

export class Entity {
  constructor(
    public x: number,
    public y: number,
    public char: string,
    public fg: string = '#fff',
    public bg: string = '#000',
    public name: string = '<Unnamed>',
    public blocksMovement: boolean = false,
  ) {}

  move(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
  }
}

export class Actor extends Entity {
  constructor(
    public x: number,
    public y: number,
    public char: string,
    public fg: string = '#fff',
    public bg: string = '#000',
    public name: string = '<Unnamed>',
    public ai: BaseAI | null,
    public fighter: Fighter,
  ) {
    super(x, y, char, fg, bg, name, true);
    this.fighter.entity = this;
  }

  public get isAlive(): boolean {
    return !!this.ai || window.engine.player === this;
  }
}

export function spawnPlayer(x: number, y: number): Actor {
  return new Actor(
    x,
    y,
    '@',
    '#fff',
    '#000',
    'Player',
    null,
    new Fighter(30, 2, 5),
  );
}

export function spawnOrc(x: number, y: number): Entity {
  return new Actor(
    x,
    y,
    'o',
    '#3f7f3f',
    '#000',
    'Orc',
    new HostileEnemy(),
    new Fighter(10, 0, 3),
  );
}

export function spawnTroll(x: number, y: number): Entity {
  return new Actor(
    x,
    y,
    'T',
    '#007f00',
    '#000',
    'Troll',
    new HostileEnemy(),
    new Fighter(16, 1, 4),
  );
}
