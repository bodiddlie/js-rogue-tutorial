import { Actor, Entity } from './entity';
import { Colors } from './colors';
import { EngineState } from './engine';

export interface Action {
  perform: (entity: Entity) => void;
}

export class WaitAction implements Action {
  perform(_entity: Entity) {}
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

    if (window.engine.gameMap.getActorAtLocation(destX, destY)) {
      return new MeleeAction(this.dx, this.dy).perform(entity as Actor);
    } else {
      return new MovementAction(this.dx, this.dy).perform(entity);
    }
  }
}

export class MeleeAction extends ActionWithDirection {
  perform(actor: Actor) {
    const destX = actor.x + this.dx;
    const destY = actor.y + this.dy;

    const target = window.engine.gameMap.getActorAtLocation(destX, destY);
    if (!target) return;

    const damage = actor.fighter.power - target.fighter.defense;
    const attackDescription = `${actor.name.toUpperCase()} attacks ${
      target.name
    }`;

    const fg =
      actor.name === 'Player' ? Colors.PlayerAttack : Colors.EnemyAttack;
    if (damage > 0) {
      window.engine.messageLog.addMessage(
        `${attackDescription} for ${damage} hit points.`,
        fg,
      );
      target.fighter.hp -= damage;
    } else {
      window.engine.messageLog.addMessage(
        `${attackDescription} but does no damage.`,
        fg,
      );
    }
  }
}

export class LogAction implements Action {
  perform(_entity: Entity) {
    window.engine.state = EngineState.Log;
  }
}

interface MovementMap {
  [key: string]: Action;
}

const MOVE_KEYS: MovementMap = {
  // Arrow Keys
  ArrowUp: new BumpAction(0, -1),
  ArrowDown: new BumpAction(0, 1),
  ArrowLeft: new BumpAction(-1, 0),
  ArrowRight: new BumpAction(1, 0),
  Home: new BumpAction(-1, -1),
  End: new BumpAction(-1, 1),
  PageUp: new BumpAction(1, -1),
  PageDown: new BumpAction(1, 1),
  // Numpad Keys
  1: new BumpAction(-1, 1),
  2: new BumpAction(0, 1),
  3: new BumpAction(1, 1),
  4: new BumpAction(-1, 0),
  6: new BumpAction(1, 0),
  7: new BumpAction(-1, -1),
  8: new BumpAction(0, -1),
  9: new BumpAction(1, -1),
  // Vi keys
  h: new BumpAction(-1, 0),
  j: new BumpAction(0, 1),
  k: new BumpAction(0, -1),
  l: new BumpAction(1, 0),
  y: new BumpAction(-1, -1),
  u: new BumpAction(1, -1),
  b: new BumpAction(-1, 1),
  n: new BumpAction(1, 1),
  // Wait keys
  5: new WaitAction(),
  '.': new WaitAction(),
  // UI keys
  v: new LogAction(),
};

export function handleGameInput(event: KeyboardEvent): Action {
  return MOVE_KEYS[event.key];
}

interface LogMap {
  [key: string]: number;
}
const LOG_KEYS: LogMap = {
  ArrowUp: -1,
  ArrowDown: 1,
};

export function handleLogInput(event: KeyboardEvent): number {
  if (event.key === 'Home') {
    window.engine.logCursorPosition = 0;
    return 0;
  }
  if (event.key === 'End') {
    window.engine.logCursorPosition =
      window.engine.messageLog.messages.length - 1;
    return 0;
  }

  const scrollAmount = LOG_KEYS[event.key];

  if (!scrollAmount) {
    window.engine.state = EngineState.Game;
    return 0;
  }
  return scrollAmount;
}
