import { BaseComponent } from './base-component';
import { Actor, Item } from '../entity';
import { EquipmentType } from '../equipment-types';

type Slot = {
  [slotName: string]: Item | null;
};

export class Equipment extends BaseComponent {
  parent: Actor | null;
  slots: Slot;

  constructor(weapon: Item | null = null, armor: Item | null = null) {
    super();
    this.slots = {
      weapon,
      armor,
    };
    this.parent = null;
  }

  public get defenseBonus(): number {
    let bonus = 0;
    if (this.slots['weapon'] && this.slots['weapon'].equippable) {
      bonus += this.slots['weapon'].equippable.defenseBonus;
    }
    if (this.slots['armor'] && this.slots['armor'].equippable) {
      bonus += this.slots['armor'].equippable.defenseBonus;
    }
    return bonus;
  }

  public get powerBonus(): number {
    let bonus = 0;
    if (this.slots['weapon'] && this.slots['weapon'].equippable) {
      bonus += this.slots['weapon'].equippable.powerBonus;
    }
    if (this.slots['armor'] && this.slots['armor'].equippable) {
      bonus += this.slots['armor'].equippable.powerBonus;
    }
    return bonus;
  }

  itemIsEquipped(item: Item): boolean {
    return this.slots['weapon'] === item || this.slots['armor'] === item;
  }

  unequipMessage(itemName: string) {
    window.messageLog.addMessage(`You remove the ${itemName}.`);
  }

  equipMessage(itemName: string) {
    window.messageLog.addMessage(`You equip the ${itemName}.`);
  }

  equipToSlot(slot: string, item: Item, addMessage: boolean) {
    const currentItem = this.slots[slot];
    if (currentItem) {
      this.unequipFromSlot(slot, addMessage);
    }
    this.slots[slot] = item;

    if (addMessage) {
      this.equipMessage(item.name);
    }
  }

  unequipFromSlot(slot: string, addMessage: boolean) {
    const currentItem = this.slots[slot];
    if (addMessage && currentItem) {
      this.unequipMessage(currentItem.name);
    }
    this.slots[slot] = null;
  }

  toggleEquip(item: Item, addMessage: boolean = true) {
    let slot = 'armor';
    if (
      item.equippable &&
      item.equippable.equipmentType === EquipmentType.Weapon
    ) {
      slot = 'weapon';
    }

    if (this.slots[slot] === item) {
      this.unequipFromSlot(slot, addMessage);
    } else {
      this.equipToSlot(slot, item, addMessage);
    }
  }
}
