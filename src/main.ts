import { spawnPlayer } from './entity';
import { Engine } from './engine';
import { MessageLog } from './message-log';
import { Colors } from './colors';

declare global {
  interface Window {
    engine: Engine;
    messageLog: MessageLog;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.messageLog = new MessageLog();
  window.engine = new Engine(spawnPlayer(Engine.WIDTH / 2, Engine.HEIGHT / 2));
  window.messageLog.addMessage(
    'Hello and welcome, adventurer, to yet another dungeon!',
    Colors.WelcomeText,
  );
  window.engine.screen.render();
});
