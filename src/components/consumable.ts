import { Actor, Entity, Item } from '../entity';
import { Action, ItemAction } from '../actions';
import { Colors } from '../colors';
import { Inventory } from './inventory';
import {
  AreaRangedAttackHandler,
  SingleRangedAttackHandler,
} from '../input-handler';
import { ConfusedEnemy } from './ai';
import { ImpossibleException } from '../exceptions';
import { GameMap } from '../game-map';

export abstract class Consumable {
  protected constructor(public parent: Item | null) {}

  getAction(): Action | null {
    if (this.parent) {
      return new ItemAction(this.parent);
    }
    return null;
  }

  abstract activate(action: ItemAction, entity: Entity, gameMap: GameMap): void;

  consume() {
    const item = this.parent;
    if (item) {
      const inventory = item.parent;
      if (inventory instanceof Inventory) {
        const index = inventory.items.indexOf(item);
        if (index >= 0) {
          inventory.items.splice(index, 1);
        }
      }
    }
  }
}

export class HealingConsumable extends Consumable {
  constructor(public amount: number, public parent: Item | null = null) {
    super(parent);
  }

  activate(_action: ItemAction, entity: Entity) {
    const consumer = entity as Actor;
    if (!consumer) return;

    const amountRecovered = consumer.fighter.heal(this.amount);

    if (amountRecovered > 0) {
      window.messageLog.addMessage(
        `You consume the ${this.parent?.name}, and recover ${amountRecovered} HP!`,
        Colors.HealthRecovered,
      );
      this.consume();
    } else {
      throw new ImpossibleException('Your health is already full.');
    }
  }
}

export class LightningConsumable extends Consumable {
  constructor(
    public damage: number,
    public maxRange: number,
    parent: Item | null = null,
  ) {
    super(parent);
  }

  activate(_action: ItemAction, entity: Entity, gameMap: GameMap) {
    let target: Actor | null = null;
    let closestDistance = this.maxRange + 1.0;

    for (const actor of gameMap.actors) {
      if (
        !Object.is(actor, entity) &&
        gameMap.tiles[actor.y][actor.x].visible
      ) {
        const distance = entity.distance(actor.x, actor.y);
        if (distance < closestDistance) {
          target = actor;
          closestDistance = distance;
        }
      }
    }

    if (target) {
      window.messageLog.addMessage(
        `A lightning bolt strikes the ${target.name} with a loud thunder, for ${this.damage} damage!`,
      );
      target.fighter.takeDamage(this.damage);
      this.consume();
    } else {
      window.messageLog.addMessage('No enemy is close enough to strike.');
      throw new ImpossibleException('No enemy is close enough to strike.');
    }
  }
}

export class ConfusionConsumable extends Consumable {
  constructor(public numberOfTurns: number, parent: Item | null = null) {
    super(parent);
  }

  getAction(): Action | null {
    window.messageLog.addMessage(
      'Select a target location.',
      Colors.NeedsTarget,
    );
    window.engine.screen.inputHandler = new SingleRangedAttackHandler(
      (x, y) => {
        return new ItemAction(this.parent, [x, y]);
      },
    );
    return null;
  }

  activate(action: ItemAction, entity: Entity, gameMap: GameMap) {
    const target = action.targetActor(gameMap);

    if (!target) {
      throw new ImpossibleException('You must select an enemy to target.');
    }
    if (!gameMap.tiles[target.y][target.x].visible) {
      throw new ImpossibleException(
        'You cannot target an area you cannot see.',
      );
    }
    if (Object.is(target, entity)) {
      throw new ImpossibleException('You cannot confuse yourself!');
    }

    window.messageLog.addMessage(
      `The eyes of the ${target.name} look vacant, as it starts to stumble around!`,
      Colors.StatusEffectApplied,
    );
    target.ai = new ConfusedEnemy(target.ai, this.numberOfTurns);
    this.consume();
  }
}

export class FireballDamageConsumable extends Consumable {
  constructor(
    public damage: number,
    public radius: number,
    parent: Item | null = null,
  ) {
    super(parent);
  }

  getAction(): Action | null {
    window.messageLog.addMessage(
      'Select a target location.',
      Colors.NeedsTarget,
    );
    window.engine.screen.inputHandler = new AreaRangedAttackHandler(
      this.radius,
      (x, y) => {
        return new ItemAction(this.parent, [x, y]);
      },
    );
    return null;
  }

  activate(action: ItemAction, _entity: Entity, gameMap: GameMap) {
    const { targetPosition } = action;

    if (!targetPosition) {
      throw new ImpossibleException('You must select an area to target.');
    }
    const [x, y] = targetPosition;
    if (!gameMap.tiles[y][x].visible) {
      throw new ImpossibleException(
        'You cannot target an area that you cannot see.',
      );
    }

    let targetsHit = false;
    for (let actor of gameMap.actors) {
      if (actor.distance(x, y) <= this.radius) {
        window.messageLog.addMessage(
          `The ${actor.name} is engulfed in a fiery explosion, taking ${this.damage} damage!`,
        );
        actor.fighter.takeDamage(this.damage);
        targetsHit = true;
      }

      if (!targetsHit) {
        throw new ImpossibleException('There are no targets in the radius.');
      }
      this.consume();
    }
  }
}
