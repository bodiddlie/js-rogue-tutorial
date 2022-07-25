import * as ROT from 'rot-js';

import {
  handleGameInput,
  handleInventoryInput,
  handleLogInput,
} from './input-handler';
import { Actor } from './entity';
import { GameMap } from './game-map';
import { generateDungeon } from './procgen';
import {
  renderFrameWithTitle,
  renderHealthBar,
  renderNamesAtLocation,
} from './render-functions';
import { MessageLog } from './message-log';
import { Colors } from './colors';

export class Engine {
  public static readonly WIDTH = 80;
  public static readonly HEIGHT = 50;
  public static readonly MAP_WIDTH = 80;
  public static readonly MAP_HEIGHT = 43;
  public static readonly MIN_ROOM_SIZE = 6;
  public static readonly MAX_ROOM_SIZE = 10;
  public static readonly MAX_ROOMS = 30;
  public static readonly MAX_MONSTERS_PER_ROOM = 2;
  public static readonly MAX_ITEMS_PER_ROOM = 2;

  display: ROT.Display;
  gameMap: GameMap;
  messageLog: MessageLog;
  mousePosition: [number, number];
  _state: EngineState;
  logCursorPosition: number;

  constructor(public player: Actor) {
    this.display = new ROT.Display({
      width: Engine.WIDTH,
      height: Engine.HEIGHT,
      forceSquareRatio: true,
    });
    this._state = EngineState.Game;
    this.mousePosition = [0, 0];
    const container = this.display.getContainer()!;
    this.logCursorPosition = 0;
    document.body.appendChild(container);

    this.messageLog = new MessageLog();
    this.messageLog.addMessage(
      'Hello and welcome, adventurer, to yet another dungeon!',
      Colors.WelcomeText,
    );

    this.gameMap = generateDungeon(
      Engine.MAP_WIDTH,
      Engine.MAP_HEIGHT,
      Engine.MAX_ROOMS,
      Engine.MIN_ROOM_SIZE,
      Engine.MAX_ROOM_SIZE,
      Engine.MAX_MONSTERS_PER_ROOM,
      Engine.MAX_ITEMS_PER_ROOM,
      player,
      this.display,
    );

    window.addEventListener('keydown', (event) => {
      this.update(event);
    });

    window.addEventListener('mousemove', (event) => {
      this.mousePosition = this.display.eventToPosition(event);
      this.render();
    });

    this.gameMap.updateFov(this.player);
  }

  public get state() {
    return this._state;
  }

  public set state(value) {
    this._state = value;
    this.logCursorPosition = this.messageLog.messages.length - 1;
  }

  handleEnemyTurns() {
    this.gameMap.actors.forEach((e) => {
      if (e.isAlive) {
        try {
          e.ai?.perform(e);
        } catch {}
      }
    });
  }

  update(event: KeyboardEvent) {
    if (this.state === EngineState.Game) {
      this.processGameLoop(event);
    } else if (this.state === EngineState.Log) {
      this.processLogLoop(event);
    } else if (
      this.state === EngineState.UseInventory ||
      this.state === EngineState.DropInventory
    ) {
      this.processInventoryLoop(event);
    }

    this.render();
  }

  processGameLoop(event: KeyboardEvent) {
    if (this.player.fighter.hp > 0) {
      const action = handleGameInput(event);

      if (action) {
        try {
          action.perform(this.player);
          if (this.state === EngineState.Game) {
            this.handleEnemyTurns();
          }
        } catch {}
      }
    }

    this.gameMap.updateFov(this.player);
  }

  processLogLoop(event: KeyboardEvent) {
    const scrollAmount = handleLogInput(event);
    if (scrollAmount < 0 && this.logCursorPosition === 0) {
      this.logCursorPosition = this.messageLog.messages.length - 1;
    } else if (
      scrollAmount > 0 &&
      this.logCursorPosition === this.messageLog.messages.length - 1
    ) {
      this.logCursorPosition = 0;
    } else {
      this.logCursorPosition = Math.max(
        0,
        Math.min(
          this.logCursorPosition + scrollAmount,
          this.messageLog.messages.length - 1,
        ),
      );
    }
  }

  processInventoryLoop(event: KeyboardEvent) {
    const action = handleInventoryInput(event);
    action?.perform(this.player);
  }

  render() {
    this.display.clear();
    this.messageLog.render(this.display, 21, 45, 40, 5);

    renderHealthBar(
      this.display,
      this.player.fighter.hp,
      this.player.fighter.maxHp,
      20,
    );

    renderNamesAtLocation(21, 44);

    this.gameMap.render();

    if (this.state === EngineState.Log) {
      renderFrameWithTitle(3, 3, 74, 38, 'Message History');
      this.messageLog.renderMessages(
        this.display,
        4,
        4,
        72,
        36,
        this.messageLog.messages.slice(0, this.logCursorPosition + 1),
      );
    }
    if (this.state === EngineState.UseInventory) {
      this.renderInventory('Select an item to use');
    }
    if (this.state === EngineState.DropInventory) {
      this.renderInventory('Select an item to drop');
    }
  }

  renderInventory(title: string) {
    const itemCount = this.player.inventory.items.length;
    const height = itemCount + 2 <= 3 ? 3 : itemCount + 2;
    const width = title.length + 4;
    const x = this.player.x <= 30 ? 40 : 0;
    const y = 0;

    renderFrameWithTitle(x, y, width, height, title);

    if (itemCount > 0) {
      this.player.inventory.items.forEach((i, index) => {
        const key = String.fromCharCode('a'.charCodeAt(0) + index);
        this.display.drawText(x + 1, y + index + 1, `(${key}) ${i.name}`);
      });
    } else {
      this.display.drawText(x + 1, y + 1, '(Empty)');
    }
  }
}

export enum EngineState {
  Game,
  Dead,
  Log,
  UseInventory,
  DropInventory,
}
