import { Entity } from './entity';

export interface Action {
  perform: (entity: Entity) => void;
}

export abstract class ActionWithDirection implements Action {
  constructor(public dx: number, public dy: number) {}

  perform(_entity: Entity) {}
}

export class MovementAction extends ActionWithDirection {
  perform(entity: Entity) {
    const destX = entity.x + this.dx;
    const destY = entity.y + this.dy;

    if (!window.engine.gameMap.isInBounds(destX, destY)) return;
    if (!window.engine.gameMap.tiles[destY][destX].walkable) return;
    if (window.engine.gameMap.getBlockingEntityAtLocation(destX, destY)) return;
    entity.move(this.dx, this.dy);
  }
}

export class BumpAction extends ActionWithDirection {
  perform(entity: Entity) {
    const destX = entity.x + this.dx;
    const destY = entity.y + this.dy;

    if (window.engine.gameMap.getBlockingEntityAtLocation(destX, destY)) {
      return new MeleeAction(this.dx, this.dy).perform(entity);
    } else {
      return new MovementAction(this.dx, this.dy).perform(entity);
    }
  }
}

export class MeleeAction extends ActionWithDirection {
  perform(entity: Entity) {
    const destX = entity.x + this.dx;
    const destY = entity.y + this.dy;

    const target = window.engine.gameMap.getBlockingEntityAtLocation(
      destX,
      destY,
    );

    if (!target) return;

    console.log(`You kick the ${target.name}, much to its annoyance!`);
  }
}

interface MovementMap {
  [key: string]: Action;
}

const MOVE_KEYS: MovementMap = {
  ArrowUp: new BumpAction(0, -1),
  ArrowDown: new BumpAction(0, 1),
  ArrowLeft: new BumpAction(-1, 0),
  ArrowRight: new BumpAction(1, 0),
};

export function handleInput(event: KeyboardEvent): Action {
  return MOVE_KEYS[event.key];
}
