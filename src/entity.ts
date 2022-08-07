import { BaseAI, HostileEnemy } from './components/ai';
import { Fighter } from './components/fighter';
import { Inventory } from './components/inventory';
import { GameMap } from './game-map';
import {
  ConfusionConsumable,
  Consumable,
  FireballDamageConsumable,
  HealingConsumable,
  LightningConsumable,
} from './components/consumable';
import { BaseComponent } from './components/base-component';

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
    public parent: GameMap | BaseComponent | null = null,
  ) {
    if (this.parent && this.parent instanceof GameMap) {
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

  place(x: number, y: number, gameMap: GameMap | undefined) {
    this.x = x;
    this.y = y;
    if (gameMap) {
      if (this.parent) {
        if (this.parent === gameMap) {
          gameMap.removeEntity(this);
        }
      }
      this.parent = gameMap;
      gameMap.entities.push(this);
    }
  }

  distance(x: number, y: number) {
    return Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
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
    public inventory: Inventory,
    public parent: GameMap | null = null,
  ) {
    super(x, y, char, fg, bg, name, true, RenderOrder.Actor, parent);
    this.fighter.parent = this;
    this.inventory.parent = this;
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
    public parent: GameMap | BaseComponent | null = null,
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
    new Inventory(26),
    gameMap,
  );
}

export function spawnOrc(gameMap: GameMap, x: number, y: number): Actor {
  return new Actor(
    x,
    y,
    'o',
    '#3f7f3f',
    '#000',
    'Orc',
    new HostileEnemy(),
    new Fighter(10, 0, 3),
    new Inventory(0),
    gameMap,
  );
}

export function spawnTroll(gameMap: GameMap, x: number, y: number): Actor {
  return new Actor(
    x,
    y,
    'T',
    '#007f00',
    '#000',
    'Troll',
    new HostileEnemy(),
    new Fighter(16, 1, 4),
    new Inventory(0),
    gameMap,
  );
}

export function spawnHealthPotion(
  gameMap: GameMap,
  x: number,
  y: number,
): Item {
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

export function spawnLightningScroll(
  gameMap: GameMap,
  x: number,
  y: number,
): Item {
  return new Item(
    x,
    y,
    '~',
    '#FFFF00',
    '#000',
    'Lightning Scroll',
    new LightningConsumable(20, 5),
    gameMap,
  );
}

export function spawnConfusionScroll(
  gameMap: GameMap,
  x: number,
  y: number,
): Item {
  return new Item(
    x,
    y,
    '~',
    '#cf3fff',
    '#000',
    'Confusion Scroll',
    new ConfusionConsumable(10),
    gameMap,
  );
}

export function spawnFireballScroll(
  gameMap: GameMap,
  x: number,
  y: number,
): Item {
  return new Item(
    x,
    y,
    '~',
    '#ff0000',
    '#000',
    'Fireball Scroll',
    new FireballDamageConsumable(12, 3),
    gameMap,
  );
}
