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

  public get center(): [number, number] {
    const centerX = this.x + Math.floor(this.width / 2);
    const centerY = this.y + Math.floor(this.height / 2);
    return [centerX, centerY];
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

  for (let tile of connectRooms(room1, room2)) {
    console.log(tile);
    dungeon.tiles[tile[1]][tile[0]] = { ...FLOOR_TILE };
  }

  return dungeon;
}

function* connectRooms(
  a: RectangularRoom,
  b: RectangularRoom,
): Generator<[number, number], void, void> {
  // set the start point of our tunnel at the center of the first room
  let current = a.center;
  // set the end point at the center of the second room
  const end = b.center;

  // flip a coin to see if we go horizontally first or vertically
  let horizontal = Math.random() < 0.5;

  // we'll loop until our current is the same as the end point
  while (current[0] !== end[0] || current[1] !== end[1]) {
    if (horizontal) {
      // are we tunneling left or right?
      const direction = Math.sign(end[0] - current[0]);
      // if direction is 0 we have hit the destination in one direction
      if (direction !== 0) {
        current[0] += direction;
        yield current;
      }
      // we've finsihed in this direction so switch to vertical
      horizontal = false;
    } else {
      const direction = Math.sign(end[1] - current[1]);
      // if direction is 0 we have hit the destination in one direction
      if (direction !== 0) {
        current[1] += direction;
        yield current;
      }
      // we've finsihed in this direction so switch to horizontal
      horizontal = true;
    }
  }
}
