import { BaseComponent } from './base-component';
import { Item } from '../entity';
import { EquipmentType } from '../equipment-types';

export class Equippable extends BaseComponent {
  parent: Item | null;

  constructor(
    public equipmentType: EquipmentType,
    public powerBonus: number = 0,
    public defenseBonus: number = 0,
  ) {
    super();
    this.parent = null;
  }
}

export class Dagger extends Equippable {
  constructor() {
    super(EquipmentType.Weapon, 2);
  }
}

export class Sword extends Equippable {
  constructor() {
    super(EquipmentType.Weapon, 4);
  }
}

export class LeatherArmor extends Equippable {
  constructor() {
    super(EquipmentType.Armor, 0, 1);
  }
}

export class ChainMail extends Equippable {
  constructor() {
    super(EquipmentType.Armor, 0, 3);
  }
}
