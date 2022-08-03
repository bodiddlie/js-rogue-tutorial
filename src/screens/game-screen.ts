import { BaseScreen } from './base-screen';
import { GameMap } from '../game-map';
import { Display } from 'rot-js';
import { generateDungeon } from '../procgen';
import { Actor } from '../entity';
import {
  BaseInputHandler,
  GameInputHandler,
  InputState,
} from '../input-handler';
import { Action } from '../actions';
import { ImpossibleException } from '../exceptions';
import { Colors } from '../colors';
import {
  renderFrameWithTitle,
  renderHealthBar,
  renderNamesAtLocation,
} from '../render-functions';
import { HostileEnemy } from '../components/ai';

export class GameScreen extends BaseScreen {
  public static readonly MAP_WIDTH = 80;
  public static readonly MAP_HEIGHT = 43;
  public static readonly MIN_ROOM_SIZE = 6;
  public static readonly MAX_ROOM_SIZE = 10;
  public static readonly MAX_ROOMS = 30;
  public static readonly MAX_MONSTERS_PER_ROOM = 2;
  public static readonly MAX_ITEMS_PER_ROOM = 2;

  gameMap: GameMap;
  inputHandler: BaseInputHandler;

  constructor(display: Display, player: Actor) {
    super(display, player);

    this.gameMap = generateDungeon(
      GameScreen.MAP_WIDTH,
      GameScreen.MAP_HEIGHT,
      GameScreen.MAX_ROOMS,
      GameScreen.MIN_ROOM_SIZE,
      GameScreen.MAX_ROOM_SIZE,
      GameScreen.MAX_MONSTERS_PER_ROOM,
      GameScreen.MAX_ITEMS_PER_ROOM,
      this.player,
      this.display,
    );

    this.inputHandler = new GameInputHandler();
    this.gameMap.updateFov(this.player);
  }

  handleEnemyTurns() {
    this.gameMap?.actors.forEach((e) => {
      if (e.isAlive) {
        try {
          e.ai?.perform(e, this.gameMap);
        } catch {}
      }
    });
  }

  update(event: KeyboardEvent): BaseScreen {
    if (event.key === 's') {
      this.saveGame();
      return this;
    }

    const action = this.inputHandler.handleKeyboardInput(event);
    if (action instanceof Action) {
      try {
        action.perform(this.player, this.gameMap);
        this.handleEnemyTurns();
        this.gameMap?.updateFov(this.player);
      } catch (error) {
        if (error instanceof ImpossibleException) {
          window.messageLog.addMessage(error.message, Colors.Impossible);
        }
      }
    }

    this.inputHandler = this.inputHandler.nextHandler;

    this.render();
    return this;
  }

  render() {
    this.display.clear();
    window.messageLog.render(this.display, 21, 45, 40, 5);

    renderHealthBar(
      this.display,
      this.player.fighter.hp,
      this.player.fighter.maxHp,
      20,
    );

    renderNamesAtLocation(21, 44, this.inputHandler.mousePosition);

    this.gameMap?.render();

    if (this.inputHandler.inputState === InputState.Log) {
      renderFrameWithTitle(3, 3, 74, 38, 'Message History');
      window.messageLog.renderMessages(
        this.display,
        4,
        4,
        72,
        36,
        window.messageLog.messages.slice(
          0,
          this.inputHandler.logCursorPosition + 1,
        ),
      );
    }
    if (this.inputHandler.inputState === InputState.UseInventory) {
      this.renderInventory('Select an item to use');
    }
    if (this.inputHandler.inputState === InputState.DropInventory) {
      this.renderInventory('Select an item to drop');
    }
    if (this.inputHandler.inputState === InputState.Target) {
      const [x, y] = this.inputHandler.mousePosition;
      this.display.drawOver(x, y, null, '#000', '#fff');
    }
    this.inputHandler.onRender(this.display);
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

  private saveGame() {
    console.log(JSON.stringify(this.toObject()));
    try {
      localStorage.setItem('roguesave', JSON.stringify(this.toObject()));
    } catch (err) {
      console.log(err);
    }
  }

  private toObject(): SerializedGameMap {
    return {
      width: this.gameMap.width,
      height: this.gameMap.height,
      entities: this.gameMap.entities.map((e) => {
        let fighter = null;
        let aiType = null;
        let inventory = null;

        if (e instanceof Actor) {
          const actor = e as Actor;
          const { maxHp, _hp: hp, defense, power } = actor.fighter;
          fighter = { maxHp, hp, defense, power };
          if (actor.ai) {
            aiType = actor.ai instanceof HostileEnemy ? 'hostile' : 'confused';
          }
          if (actor.inventory) {
            inventory = [];
            for (let item of actor.inventory.items) {
              inventory.push(item.name);
            }
          }
        }
        return {
          x: e.x,
          y: e.y,
          char: e.char,
          fg: e.fg,
          bg: e.bg,
          name: e.name,
          fighter,
          aiType,
          inventory,
        };
      }),
    };
  }
}

type SerializedGameMap = {
  width: number;
  height: number;
  entities: SerializedEntity[];
};

type SerializedEntity = {
  x: number;
  y: number;
  char: string;
  fg: string;
  bg: string;
  name: string;
  fighter: SerializedFighter | null;
  aiType: string | null;
  inventory: SerializedItem[] | null;
};

type SerializedFighter = {
  maxHp: number;
  hp: number;
  defense: number;
  power: number;
};

type SerializedItem = {
  itemType: string;
};