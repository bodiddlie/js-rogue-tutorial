import { Entity } from '../entity';
import { GameMap } from '../game-map';

export abstract class BaseComponent {
  parent: Entity | null;

  protected constructor() {
    this.parent = null;
  }

  public get gameMap(): GameMap | undefined {
    return this.parent?.gameMap;
  }
}
