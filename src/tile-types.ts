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
  dark: { char: '.', fg: '#646464', bg: '#000' },
  light: { char: '.', fg: '#c8c8c8', bg: '#000' },
};

export const WALL_TILE: Tile = {
  walkable: false,
  transparent: false,
  visible: false,
  seen: false,
  dark: { char: '#', fg: '#646464', bg: '#000' },
  light: { char: '#', fg: '#c8c8c8', bg: '#000' },
};

export const STAIRS_DOWN_TILE: Tile = {
  walkable: true,
  transparent: true,
  visible: false,
  seen: false,
  dark: { char: '>', fg: '#646464', bg: '#000' },
  light: { char: '>', fg: '#c8c8c8', bg: '#000' },
};
