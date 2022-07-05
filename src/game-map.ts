import type { Tile } from './tile-types';
import { FLOOR_TILE, WALL_TILE } from './tile-types';
import { Display } from 'rot-js';

export class GameMap {
  width: number;
  height: number;
  display: Display;

  tiles: Tile[][];

  constructor(width: number, height: number, display: Display) {
    this.width = width;
    this.height = height;
    this.display = display;

    this.tiles = new Array(this.height);
    for (let y = 0; y < this.height; y++) {
      const row = new Array(this.width);
      for (let x = 0; x < this.width; x++) {
        if (x >= 30 && x <= 32 && y === 22) {
          row[x] = { ...WALL_TILE };
        } else {
          row[x] = { ...FLOOR_TILE };
        }
      }
      this.tiles[y] = row;
    }
  }

  isInBounds(x: number, y: number) {
    return 0 <= x && x < this.width && 0 <= y && y < this.height;
  }

  render() {
    for (let y = 0; y < this.tiles.length; y++) {
      const row = this.tiles[y];
      for (let x = 0; x < row.length; x++) {
        const tile = row[x];
        this.display.draw(x, y, tile.dark.char, tile.dark.fg, tile.dark.bg);
      }
    }
  }
}
