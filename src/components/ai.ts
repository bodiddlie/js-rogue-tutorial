import * as ROT from 'rot-js';

import {
  Action,
  BumpAction,
  MeleeAction,
  MovementAction,
  WaitAction,
} from '../actions';
import { Actor, Entity } from '../entity';
import { generateRandomNumber } from '../procgen';

export abstract class BaseAI implements Action {
  path: [number, number][];

  protected constructor() {
    this.path = [];
  }

  abstract perform(entity: Entity): void;

  /**
   * Compute and return a path to the target position.
   *
   * If there is no valid path then return an empty list.
   *
   * @param destX
   * @param destY
   * @param entity
   */
  calculatePathTo(destX: number, destY: number, entity: Entity) {
    const isPassable = (x: number, y: number) =>
      window.engine.gameMap.tiles[y][x].walkable;
    const dijkstra = new ROT.Path.Dijkstra(destX, destY, isPassable, {});

    this.path = [];

    dijkstra.compute(entity.x, entity.y, (x: number, y: number) => {
      this.path.push([x, y]);
    });
    this.path.shift();
  }
}

export class HostileEnemy extends BaseAI {
  constructor() {
    super();
  }

  perform(entity: Entity) {
    const target = window.engine.player;
    const dx = target.x - entity.x;
    const dy = target.y - entity.y;
    const distance = Math.max(Math.abs(dx), Math.abs(dy));

    if (window.engine.gameMap.tiles[entity.y][entity.x].visible) {
      if (distance <= 1) {
        return new MeleeAction(dx, dy).perform(entity as Actor);
      }
      this.calculatePathTo(target.x, target.y, entity);
    }

    if (this.path.length > 0) {
      const [destX, destY] = this.path[0];
      this.path.shift();
      return new MovementAction(destX - entity.x, destY - entity.y).perform(
        entity,
      );
    }

    return new WaitAction().perform(entity);
  }
}

const directions: [number, number][] = [
  [-1, -1], // Northwest
  [0, -1], // North
  [1, -1], // Northeast
  [-1, 0], // West
  [1, 0], // East
  [-1, 1], // Southwest
  [0, 1], // South
  [1, 1], // Southeast
];

export class ConfusedEnemy extends BaseAI {
  constructor(public previousAi: BaseAI | null, public turnsRemaining: number) {
    super();
  }

  perform(entity: Entity) {
    const actor = entity as Actor;
    if (!actor) return;

    if (this.turnsRemaining <= 0) {
      window.engine.messageLog.addMessage(
        `The ${entity.name} is no longer confused.`,
      );
      actor.ai = this.previousAi;
    } else {
      const [directionX, directionY] =
        directions[generateRandomNumber(0, directions.length)];
      this.turnsRemaining -= 1;
      const action = new BumpAction(directionX, directionY);
      action.perform(entity);
    }
  }
}
