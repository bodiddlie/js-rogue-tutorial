import { Display } from 'rot-js';

import { Colors } from './colors';

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
