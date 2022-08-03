import { BaseComponent } from './base-component';
import { Actor, Item } from '../entity';
import { GameMap } from '../game-map';

export class Inventory extends BaseComponent {
  parent: Actor | null;
  items: Item[];

  constructor(public capacity: number) {
    super();
    this.parent = null;
    this.items = [];
  }

  drop(item: Item, gameMap: GameMap) {
    const index = this.items.indexOf(item);
    if (index >= 0) {
      this.items.splice(index, 1);
      if (this.parent) {
        item.place(this.parent.x, this.parent.y, gameMap);
      }
      window.messageLog.addMessage(`You dropped the ${item.name}."`);
    }
  }
}
