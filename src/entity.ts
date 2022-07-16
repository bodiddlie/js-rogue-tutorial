export class Entity {
  constructor(
    public x: number,
    public y: number,
    public char: string,
    public fg: string = '#fff',
    public bg: string = '#000',
    public name: string = '<Unnamed>',
    public blocksMovement: boolean = false,
  ) {}

  move(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
  }
}

export function spawnPlayer(x: number, y: number): Entity {
  return new Entity(x, y, '@');
}

export function spawnOrc(x: number, y: number): Entity {
  return new Entity(x, y, 'o', '#3f7f3f', '#000', 'Orc', true);
}

export function spawnTroll(x: number, y: number): Entity {
  return new Entity(x, y, 'T', '#007f00', '#000', 'Troll', true);
}
