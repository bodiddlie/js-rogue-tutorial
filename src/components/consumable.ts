import { Actor, Entity, Item } from '../entity';
import { Action, ItemAction } from '../actions';
import { Colors } from '../colors';
import { Inventory } from './inventory';

export abstract class Consumable {
  protected constructor(public parent: Item | null) {}

  getAction(): Action | null {
    if (this.parent) {
      return new ItemAction(this.parent);
    }
    return null;
  }

  abstract activate(entity: Entity): void;

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

  activate(entity: Entity) {
    const consumer = entity as Actor;
    if (!consumer) return;

    const amountRecovered = consumer.fighter.heal(this.amount);

    if (amountRecovered > 0) {
      window.engine.messageLog.addMessage(
        `You consume the ${this.parent?.name}, and recover ${amountRecovered} HP!`,
        Colors.HealthRecovered,
      );
      this.consume();
    } else {
      window.engine.messageLog.addMessage(
        'Your health is already full.',
        Colors.Impossible,
      );
      throw new Error('Your health is already full.');
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

  activate(entity: Entity) {
    let target: Actor | null = null;
    let closestDistance = this.maxRange + 1.0;

    for (const actor of window.engine.gameMap.actors) {
      if (
        !Object.is(actor, entity) &&
        window.engine.gameMap.tiles[actor.y][actor.x].visible
      ) {
        const distance = entity.distance(actor.x, actor.y);
        if (distance < closestDistance) {
          target = actor;
          closestDistance = distance;
        }
      }
    }

    if (target) {
      window.engine.messageLog.addMessage(
        `A lightning bolt strikes the ${target.name} with a loud thunder, for ${this.damage} damage!`,
      );
      target.fighter.takeDamage(this.damage);
      this.consume();
    } else {
      window.engine.messageLog.addMessage(
        'No enemy is close enough to strike.',
      );
      throw new Error('No enemy is close enough to strike.');
    }
  }
}
