// import { Colors } from './colors';
import {
  Action,
  BumpAction,
  DropItem,
  LogAction,
  PickupAction,
  WaitAction,
} from './actions';
import { Colors } from './colors';

interface LogMap {
  [key: string]: number;
}
const LOG_KEYS: LogMap = {
  ArrowUp: -1,
  ArrowDown: 1,
};

export enum InputState {
  Game,
  Dead,
  Log,
  UseInventory,
  DropInventory,
}

export abstract class BaseInputHandler {
  nextHandler: BaseInputHandler;
  protected constructor(public inputState: InputState = InputState.Game) {
    this.nextHandler = this;
  }

  abstract handleKeyboardInput(event: KeyboardEvent): Action | null;
}

interface DirectionMap {
  [key: string]: [number, number];
}

export class GameInputHandler extends BaseInputHandler {
  MOVE_KEYS: DirectionMap;
  constructor() {
    super();
    this.MOVE_KEYS = {
      // Arrow Keys
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      Home: [-1, -1],
      End: [-1, 1],
      PageUp: [1, -1],
      PageDown: [1, 1],
      // Numpad Keys
      1: [-1, 1],
      2: [0, 1],
      3: [1, 1],
      4: [-1, 0],
      6: [1, 0],
      7: [-1, -1],
      8: [0, -1],
      9: [1, -1],
      // Vi keys
      h: [-1, 0],
      j: [0, 1],
      k: [0, -1],
      l: [1, 0],
      y: [-1, -1],
      u: [1, -1],
      b: [-1, 1],
      n: [1, 1],
      // UI keys
      // g: new PickupAction(),
      // i: new InventoryAction(true),
      // d: new InventoryAction(false),
    };
  }

  handleKeyboardInput(event: KeyboardEvent): Action | null {
    if (window.engine.player.fighter.hp > 0) {
      if (event.key in this.MOVE_KEYS) {
        const [dx, dy] = this.MOVE_KEYS[event.key];
        return new BumpAction(dx, dy);
      }
      if (event.key === 'v') {
        this.nextHandler = new LogInputHandler();
      }
      if (event.key === '5' || event.key === '.') {
        return new WaitAction();
      }
      if (event.key === 'g') {
        return new PickupAction();
      }
      if (event.key === 'i') {
        this.nextHandler = new InventoryInputHandler(InputState.UseInventory);
      }
      if (event.key === 'd') {
        this.nextHandler = new InventoryInputHandler(InputState.DropInventory);
      }
    }

    return null;
  }
}

export class LogInputHandler extends BaseInputHandler {
  constructor() {
    super(InputState.Log);
  }

  handleKeyboardInput(event: KeyboardEvent): Action | null {
    if (event.key === 'Home') {
      return new LogAction(() => (window.engine.logCursorPosition = 0));
    }
    if (event.key === 'End') {
      return new LogAction(
        () =>
          (window.engine.logCursorPosition =
            window.engine.messageLog.messages.length - 1),
      );
    }

    const scrollAmount = LOG_KEYS[event.key];

    if (!scrollAmount) {
      this.nextHandler = new GameInputHandler();
    }

    return new LogAction(() => {
      if (scrollAmount < 0 && window.engine.logCursorPosition === 0) {
        window.engine.logCursorPosition =
          window.engine.messageLog.messages.length - 1;
      } else if (
        scrollAmount > 0 &&
        window.engine.logCursorPosition ===
          window.engine.messageLog.messages.length - 1
      ) {
        window.engine.logCursorPosition = 0;
      } else {
        window.engine.logCursorPosition = Math.max(
          0,
          Math.min(
            window.engine.logCursorPosition + scrollAmount,
            window.engine.messageLog.messages.length - 1,
          ),
        );
      }
    });
  }
}

export class InventoryInputHandler extends BaseInputHandler {
  constructor(inputState: InputState) {
    super(inputState);
  }

  handleKeyboardInput(event: KeyboardEvent): Action | null {
    if (event.key.length === 1) {
      const ordinal = event.key.charCodeAt(0);
      const index = ordinal - 'a'.charCodeAt(0);

      if (index >= 0 && index <= 26) {
        const item = window.engine.player.inventory.items[index];
        if (item) {
          this.nextHandler = new GameInputHandler();
          if (this.inputState === InputState.UseInventory) {
            return item.consumable.getAction();
          } else if (this.inputState === InputState.DropInventory) {
            return new DropItem(item);
          }
        } else {
          window.engine.messageLog.addMessage('Invalid entry.', Colors.Invalid);
          return null;
        }
      }
    }
    this.nextHandler = new GameInputHandler();
    return null;
  }
}
