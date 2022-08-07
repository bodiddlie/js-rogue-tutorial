import { Display } from 'rot-js';

import { Colors } from './colors';
import {GameMap} from "./game-map";

export function renderHealthBar(
  display: Display,
  currentValue: number,
  maxValue: number,
  totalWidth: number,
) {
  const barWidth = Math.floor((currentValue / maxValue) * totalWidth);

  drawColoredBar(display, 0, 45, totalWidth, Colors.BarEmpty);
  drawColoredBar(display, 0, 45, barWidth, Colors.BarFilled);

  const healthText = `HP: ${currentValue}/${maxValue}`;

  for (let i = 0; i < healthText.length; i++) {
    display.drawOver(i + 1, 45, healthText[i], Colors.White, null);
  }
}

function drawColoredBar(
  display: Display,
  x: number,
  y: number,
  width: number,
  color: Colors,
) {
  for (let pos = x; pos < x + width; pos++) {
    display.draw(pos, y, ' ', color, color);
  }
}

export function renderNamesAtLocation(
  x: number,
  y: number,
  mousePosition: [number, number],
  gameMap: GameMap
) {
  const [mouseX, mouseY] = mousePosition;
  if (
    gameMap.isInBounds(mouseX, mouseY) &&
    gameMap.tiles[mouseY][mouseX].visible
  ) {
    const names = gameMap.entities
      .filter((e) => e.x === mouseX && e.y === mouseY)
      .map((e) => e.name.charAt(0).toUpperCase() + e.name.substring(1))
      .join(', ');

    window.engine.display.drawText(x, y, names);
  }
}

export function renderFrameWithTitle(
  x: number,
  y: number,
  width: number,
  height: number,
  title: string,
) {
  const topLeft = '┌';
  const topRight = '┐';
  const bottomLeft = '└';
  const bottomRight = '┘';
  const vertical = '│';
  const horizontal = '─';
  const leftTitle = '┤';
  const rightTitle = '├';
  const empty = ' ';

  const innerWidth = width - 2;
  const innerHeight = height - 2;
  const remainingAfterTitle = innerWidth - (title.length + 2); // adding two because of the borders on left and right
  const left = Math.floor(remainingAfterTitle / 2);

  const topRow =
    topLeft +
    horizontal.repeat(left) +
    leftTitle +
    title +
    rightTitle +
    horizontal.repeat(remainingAfterTitle - left) +
    topRight;
  const middleRow = vertical + empty.repeat(innerWidth) + vertical;
  const bottomRow = bottomLeft + horizontal.repeat(innerWidth) + bottomRight;

  window.engine.display.drawText(x, y, topRow);
  for (let i = 1; i <= innerHeight; i++) {
    window.engine.display.drawText(x, y + i, middleRow);
  }
  window.engine.display.drawText(x, y + height - 1, bottomRow);
}
