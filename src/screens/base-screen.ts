import { Display } from 'rot-js';
import { Actor } from '../entity';
import { BaseInputHandler } from '../input-handler';

export abstract class BaseScreen {
  abstract inputHandler: BaseInputHandler;

  protected constructor(public display: Display, public player: Actor) {}

  abstract update(event: KeyboardEvent): BaseScreen;

  generateFloor() {}

  abstract render(): void;
}
