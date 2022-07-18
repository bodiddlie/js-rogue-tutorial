import { BaseComponent } from './base-component';
import { Entity } from '../entity';

export class Fighter implements BaseComponent {
  entity: Entity | null;
  _hp: number;

  constructor(
    public maxHp: number,
    public defense: number,
    public power: number,
  ) {
    this._hp = maxHp;
    this.entity = null;
  }

  public get hp(): number {
    return this._hp;
  }

  public set hp(value: number) {
    this._hp = Math.max(0, Math.min(value, this.maxHp));
  }
}
