export interface Graphic {
  char: string;
  fg: string;
  bg: string;
}

export interface Tile {
  walkable: boolean;
  transparent: boolean;
  visible: boolean;
  seen: boolean;
  dark: Graphic;
  light: Graphic;
}

export const FLOOR_TILE: Tile = {
  walkable: true,
  transparent: true,
  visible: false,
  seen: false,
  dark: { char: ' ', fg: '#fff', bg: '#323296' },
  light: { char: ' ', fg: '#fff', bg: '#c8b432' },
};

export const WALL_TILE: Tile = {
  walkable: false,
  transparent: false,
  visible: false,
  seen: false,
  dark: { char: ' ', fg: '#fff', bg: '#000064' },
  light: { char: ' ', fg: '#fff', bg: '#826e32' },
};
