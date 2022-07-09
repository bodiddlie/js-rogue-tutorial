import { GameMap } from './game-map';
import { FLOOR_TILE, WALL_TILE, Tile } from './tile-types';
import { Display } from 'rot-js';

class RectangularRoom {
  tiles: Tile[][];

  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
  ) {
    this.tiles = new Array(this.height);
    this.buildRoom();
  }

  buildRoom() {
    for (let y = 0; y < this.height; y++) {
      const row = new Array(this.width);
      for (let x = 0; x < this.width; x++) {
        const isWall =
          x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1;
        row[x] = isWall ? { ...WALL_TILE } : { ...FLOOR_TILE };
      }
      this.tiles[y] = row;
    }
  }
}

export function generateDungeon(
  width: number,
  height: number,
  display: Display,
): GameMap {
  const dungeon = new GameMap(width, height, display);

  const room1 = new RectangularRoom(20, 15, 10, 15);
  const room2 = new RectangularRoom(35, 15, 10, 15);

  dungeon.addRoom(room1.x, room1.y, room1.tiles);
  dungeon.addRoom(room2.x, room2.y, room2.tiles);

  return dungeon;
}
