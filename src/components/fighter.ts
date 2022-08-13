import { BaseComponent } from './base-component';
import { Actor, RenderOrder } from '../entity';
import { Colors } from '../colors';

export class Fighter extends BaseComponent {
  parent: Actor | null;
  _hp: number;

  constructor(
    public maxHp: number,
    public baseDefense: number,
    public basePower: number,
  ) {
    super();
    this._hp = maxHp;
    this.parent = null;
  }

  public get hp(): number {
    return this._hp;
  }

  public set hp(value: number) {
    this._hp = Math.max(0, Math.min(value, this.maxHp));

    if (this._hp === 0 && this.parent?.isAlive) {
      this.die();
    }
  }

  public get defenseBonus(): number {
    if (this.parent?.equipment) {
      return this.parent.equipment.defenseBonus;
    }
    return 0;
  }

  public get powerBonus(): number {
    if (this.parent?.equipment) {
      return this.parent.equipment.powerBonus;
    }
    return 0;
  }

  public get defense(): number {
    return this.baseDefense + this.defenseBonus;
  }

  public get power(): number {
    return this.basePower + this.powerBonus;
  }

  die() {
    if (!this.parent) return;

    let deathMessage = '';
    let fg = null;
    if (window.engine.player === this.parent) {
      deathMessage = 'You died!';
      fg = Colors.PlayerDie;
    } else {
      deathMessage = `${this.parent.name} is dead!`;
      fg = Colors.EnemyDie;
    }

    this.parent.char = '%';
    this.parent.fg = '#bf0000';
    this.parent.blocksMovement = false;
    this.parent.ai = null;
    this.parent.name = `Remains of ${this.parent.name}`;
    this.parent.renderOrder = RenderOrder.Corpse;

    window.messageLog.addMessage(deathMessage, fg);

    window.engine.player.level.addXp(this.parent.level.xpGiven);
  }

  heal(amount: number): number {
    if (this.hp === this.maxHp) return 0;

    const newHp = Math.min(this.maxHp, this.hp + amount);
    const amountRecovered = newHp - this.hp;
    this.hp = newHp;

    return amountRecovered;
  }

  takeDamage(amount: number) {
    this.hp -= amount;
  }
}
