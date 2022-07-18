import { Entity } from '../entity';

export interface BaseComponent {
  entity: Entity | null;
}
