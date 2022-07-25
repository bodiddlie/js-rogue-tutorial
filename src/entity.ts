import { BaseAI, HostileEnemy } from './components/ai';
import { Fighter } from './components/fighter';
import { GameMap } from './game-map';
import { Consumable, HealingConsumable } from './components/consumable';

export enum RenderOrder {
  Corpse,
  Item,
  Actor,
}

export class Entity {
  constructor(
    public x: number,
    public y: number,
    public char: string,
    public fg: string = '#fff',
    public bg: string = '#000',
    public name: string = '<Unnamed>',
    public blocksMovement: boolean = false,
    public renderOrder: RenderOrder = RenderOrder.Corpse,
    public parent: GameMap | null = null,
  ) {
    if (this.parent) {
      this.parent.entities.push(this);
    }
  }

  public get gameMap(): GameMap | undefined {
    return this.parent?.gameMap;
  }

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
    public parent: GameMap | null = null,
  ) {
    super(x, y, char, fg, bg, name, true, RenderOrder.Actor, parent);
    this.fighter.parent = this;
  }

  public get isAlive(): boolean {
    return !!this.ai || window.engine.player === this;
  }
}

export class Item extends Entity {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public char: string = '?',
    public fg: string = '#fff',
    public bg: string = '#000',
    public name: string = '<Unnamed>',
    public consumable: Consumable,
    public parent: GameMap | null = null,
  ) {
    super(x, y, char, fg, bg, name, false, RenderOrder.Item, parent);
    this.consumable.parent = this;
  }
}

export function spawnPlayer(
  x: number,
  y: number,
  gameMap: GameMap | null = null,
): Actor {
  return new Actor(
    x,
    y,
    '@',
    '#fff',
    '#000',
    'Player',
    null,
    new Fighter(30, 2, 5),
    gameMap,
  );
}

export function spawnOrc(gameMap: GameMap, x: number, y: number): Entity {
  return new Actor(
    x,
    y,
    'o',
    '#3f7f3f',
    '#000',
    'Orc',
    new HostileEnemy(),
    new Fighter(10, 0, 3),
    gameMap,
  );
}

export function spawnTroll(gameMap: GameMap, x: number, y: number): Entity {
  return new Actor(
    x,
    y,
    'T',
    '#007f00',
    '#000',
    'Troll',
    new HostileEnemy(),
    new Fighter(16, 1, 4),
    gameMap,
  );
}

export function spawnHealthPotion(
  gameMap: GameMap,
  x: number,
  y: number,
): Entity {
  return new Item(
    x,
    y,
    '!',
    '#7F00FF',
    '#000',
    'Health Potion',
    new HealingConsumable(4),
    gameMap,
  );
}
