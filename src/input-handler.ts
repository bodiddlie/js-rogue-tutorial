export interface Action {}

export interface MovementAction extends Action {
  dx: number;
  dy: number;
}

interface MovementMap {
  [key: string]: MovementAction;
}

const MOVE_KEYS: MovementMap = {
  ArrowUp: { dx: 0, dy: -1 },
  ArrowDown: { dx: 0, dy: 1 },
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
};

export function handleInput(event: KeyboardEvent): MovementAction {
  return MOVE_KEYS[event.key];
}
