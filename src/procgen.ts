import { GameMap } from './game-map';
import { FLOOR_TILE, WALL_TILE, Tile, STAIRS_DOWN_TILE } from './tile-types';
import { Display, RNG } from 'rot-js';
import { Entity, spawnMap } from './entity';

interface Bounds {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

type FloorValue = [number, number][];

type WeightedChoices = {
  floor: number;
  weights: Choice[];
};

type Choice = {
  value: string;
  weight: number;
};

const MAX_ITEMS_BY_FLOOR: FloorValue = [
  [1, 1],
  [4, 2],
];

const MAX_MONSTERS_BY_FLOOR: FloorValue = [
  [1, 2],
  [4, 3],
  [6, 5],
];

const ITEM_CHANCES: WeightedChoices[] = [
  {
    floor: 0,
    weights: [{ value: 'spawnHealthPotion', weight: 35 }],
  },
  {
    floor: 2,
    weights: [{ value: 'spawnConfusionScroll', weight: 10 }],
  },
  {
    floor: 4,
    weights: [
      { value: 'spawnLightningScroll', weight: 25 },
      { value: 'spawnSword', weight: 5 },
    ],
  },
  {
    floor: 6,
    weights: [
      { value: 'spawnFireballScroll', weight: 25 },
      { value: 'spawnChainMail', weight: 15 },
    ],
  },
];

const MONSTER_CHANCES: WeightedChoices[] = [
  {
    floor: 0,
    weights: [{ value: 'spawnOrc', weight: 80 }],
  },
  {
    floor: 3,
    weights: [{ value: 'spawnTroll', weight: 15 }],
  },
  {
    floor: 5,
    weights: [{ value: 'spawnTroll', weight: 30 }],
  },
  {
    floor: 7,
    weights: [{ value: 'spawnTroll', weight: 60 }],
  },
];

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

  get center(): [number, number] {
    const centerX = this.x + Math.floor(this.width / 2);
    const centerY = this.y + Math.floor(this.height / 2);
    return [centerX, centerY];
  }

  get bounds(): Bounds {
    return {
      x1: this.x,
      y1: this.y,
      x2: this.x + this.width - 1,
      y2: this.y + this.height - 1,
    };
  }

  intersects(other: RectangularRoom): boolean {
    return (
      this.x <= other.x + other.width &&
      this.x + this.width >= other.x &&
      this.y <= other.y + other.height &&
      this.y + this.width >= other.y
    );
  }
}

function placeEntities(
  room: RectangularRoom,
  dungeon: GameMap,
  floorNumber: number,
) {
  const numberOfMonstersToAdd = generateRandomNumber(
    0,
    getMaxValueForFloor(MAX_MONSTERS_BY_FLOOR, floorNumber),
  );
  const numberOfItemsToAdd = generateRandomNumber(
    0,
    getMaxValueForFloor(MAX_ITEMS_BY_FLOOR, floorNumber),
  );
  const bounds = room.bounds;

  for (let i = 0; i < numberOfMonstersToAdd; i++) {
    const x = generateRandomNumber(bounds.x1 + 1, bounds.x2 - 1);
    const y = generateRandomNumber(bounds.y1 + 1, bounds.y2 - 1);

    if (!dungeon.entities.some((e) => e.x == x && e.y == y)) {
      const weights = getWeights(MONSTER_CHANCES, floorNumber);
      const spawnType = RNG.getWeightedValue(weights);
      if (spawnType) {
        spawnMap[spawnType](dungeon, x, y);
      }
    }
  }

  for (let i = 0; i < numberOfItemsToAdd; i++) {
    const x = generateRandomNumber(bounds.x1 + 1, bounds.x2 - 1);
    const y = generateRandomNumber(bounds.y1 + 1, bounds.y2 - 1);

    if (!dungeon.entities.some((e) => e.x == x && e.y == y)) {
      const weights = getWeights(ITEM_CHANCES, floorNumber);
      const spawnType = RNG.getWeightedValue(weights);
      if (spawnType) {
        spawnMap[spawnType](dungeon, x, y);
      }
    }
  }
}

export function generateDungeon(
  mapWidth: number,
  mapHeight: number,
  maxRooms: number,
  minSize: number,
  maxSize: number,
  player: Entity,
  display: Display,
  currentFloor: number,
): GameMap {
  const dungeon = new GameMap(mapWidth, mapHeight, display, [player]);

  const rooms: RectangularRoom[] = [];
  let centerOfLastRoom: [number, number] = [0, 0];

  for (let count = 0; count < maxRooms; count++) {
    const width = generateRandomNumber(minSize, maxSize);
    const height = generateRandomNumber(minSize, maxSize);

    const x = generateRandomNumber(0, mapWidth - width - 1);
    const y = generateRandomNumber(0, mapHeight - height - 1);

    const newRoom = new RectangularRoom(x, y, width, height);

    if (rooms.some((r) => r.intersects(newRoom))) {
      continue;
    }

    dungeon.addRoom(x, y, newRoom.tiles);

    placeEntities(newRoom, dungeon, currentFloor);

    rooms.push(newRoom);
    centerOfLastRoom = newRoom.center;
  }

  const startPoint = rooms[0].center;
  player.x = startPoint[0];
  player.y = startPoint[1];

  for (let index = 0; index < rooms.length - 1; index++) {
    const first = rooms[index];
    const second = rooms[index + 1];

    for (let tile of connectRooms(first, second)) {
      dungeon.tiles[tile[1]][tile[0]] = { ...FLOOR_TILE };
    }
  }

  dungeon.tiles[centerOfLastRoom[1]][centerOfLastRoom[0]] = {
    ...STAIRS_DOWN_TILE,
  };
  dungeon.downstairsLocation = centerOfLastRoom;

  return dungeon;
}

export function generateRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
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
  // set our axisIndex to 0 (x axis) if horizontal or 1 (y axis) if vertical
  let axisIndex = horizontal ? 0 : 1;

  // we'll loop until our current is the same as the end point
  while (current[0] !== end[0] || current[1] !== end[1]) {
    //are we tunneling in the positive or negative direction?

    // if direction is 0 we have hit the destination in one direction
    const direction = Math.sign(end[axisIndex] - current[axisIndex]);
    if (direction !== 0) {
      current[axisIndex] += direction;
      yield current;
    } else {
      // we've finished in this direction so switch to the other
      axisIndex = axisIndex === 0 ? 1 : 0;
      yield current;
    }
  }
}

function getMaxValueForFloor(
  maxValueByFloor: FloorValue,
  floor: number,
): number {
  let current = 0;

  for (let [min, value] of maxValueByFloor) {
    if (min > floor) break;
    current = value;
  }

  return current;
}

type WeightMap = {
  [key: string]: number;
};

function getWeights(
  chancesByFloor: WeightedChoices[],
  floorNumber: number,
): WeightMap {
  let current: WeightMap = {};

  for (let { floor, weights } of chancesByFloor) {
    if (floor > floorNumber) break;

    for (let { value, weight } of weights) {
      current[value] = weight;
    }
  }

  return current;
}
