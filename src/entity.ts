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
import { Level } from './components/level';
import {
  ChainMail,
  Dagger,
  Equippable,
  LeatherArmor,
  Sword,
} from './components/equippable';
import { Equipment } from './components/equipment';

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
    public equipment: Equipment,
    public fighter: Fighter,
    public inventory: Inventory,
    public level: Level,
    public parent: GameMap | null = null,
  ) {
    super(x, y, char, fg, bg, name, true, RenderOrder.Actor, parent);
    this.fighter.parent = this;
    this.equipment.parent = this;
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
    public consumable: Consumable | null = null,
    public equippable: Equippable | null = null,
    public parent: GameMap | BaseComponent | null = null,
  ) {
    super(x, y, char, fg, bg, name, false, RenderOrder.Item, parent);
    if (this.consumable) {
      this.consumable.parent = this;
    }

    if (this.equippable) this.equippable.parent = this;
  }
}

export function spawnPlayer(
  x: number,
  y: number,
  gameMap: GameMap | null = null,
): Actor {
  const player = new Actor(
    x,
    y,
    '@',
    '#fff',
    '#000',
    'Player',
    null,
    new Equipment(),
    new Fighter(30, 1, 2),
    new Inventory(26),
    new Level(200),
    gameMap,
  );
  player.level.parent = player;
  return player;
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
    new Equipment(),
    new Fighter(10, 0, 3),
    new Inventory(0),
    new Level(0, 35),
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
    new Equipment(),
    new Fighter(16, 1, 4),
    new Inventory(0),
    new Level(0, 100),
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
    null,
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
    null,
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
    null,
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
    null,
    gameMap,
  );
}

export function spawnDagger(gameMap: GameMap, x: number, y: number): Item {
  return new Item(
    x,
    y,
    '/',
    '#00bfff',
    '#000',
    'Dagger',
    null,
    new Dagger(),
    gameMap,
  );
}

export function spawnSword(gameMap: GameMap, x: number, y: number): Item {
  return new Item(
    x,
    y,
    '/',
    '#00bfff',
    '#000',
    'Sword',
    null,
    new Sword(),
    gameMap,
  );
}

export function spawnLeatherArmor(
  gameMap: GameMap,
  x: number,
  y: number,
): Item {
  return new Item(
    x,
    y,
    '[',
    '#8b4513',
    '#000',
    'Leather Armor',
    null,
    new LeatherArmor(),
    gameMap,
  );
}

export function spawnChainMail(gameMap: GameMap, x: number, y: number): Item {
  return new Item(
    x,
    y,
    '[',
    '#8b4513',
    '#000',
    'Chain Mail',
    null,
    new ChainMail(),
    gameMap,
  );
}

type SPAWNMAP = {
  [key: string]: (gameMap: GameMap, x: number, y: number) => Entity;
};

export const spawnMap: SPAWNMAP = {
  spawnOrc,
  spawnTroll,
  spawnHealthPotion,
  spawnConfusionScroll,
  spawnLightningScroll,
  spawnFireballScroll,
  spawnDagger,
  spawnSword,
  spawnLeatherArmor,
  spawnChainMail,
};
