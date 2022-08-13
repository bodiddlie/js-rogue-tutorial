import { BaseComponent } from './base-component';
import { Actor } from '../entity';

export class Level extends BaseComponent {
  constructor(
    public levelUpBase: number = 0,
    public xpGiven: number = 0,
    public currentLevel: number = 1,
    public currentXp: number = 0,
    public levelUpFactor: number = 150,
  ) {
    super();
  }

  public get experienceToNextLevel(): number {
    return this.levelUpBase + this.currentLevel * this.levelUpFactor;
  }

  public get requiresLevelUp(): boolean {
    return this.currentXp > this.experienceToNextLevel;
  }

  addXp(xp: number) {
    if (xp === 0 || this.levelUpBase === 0) return;

    this.currentXp += xp;

    window.messageLog.addMessage(`You gain ${xp} experience points.`);

    if (this.requiresLevelUp) {
      window.messageLog.addMessage(
        `You advance to level ${this.currentLevel + 1}`,
      );
    }
  }

  private increaseLevel() {
    this.currentXp -= this.experienceToNextLevel;
    this.currentLevel++;
  }

  increaseMaxHp(amount: number = 20) {
    const actor = this.parent as Actor;
    if (!actor) return;
    actor.fighter.maxHp += amount;
    actor.fighter.hp += amount;

    window.messageLog.addMessage('Your health improves!');

    this.increaseLevel();
  }

  increasePower(amount: number = 1) {
    const actor = this.parent as Actor;
    if (!actor) return;
    actor.fighter.basePower += amount;

    window.messageLog.addMessage('You feel stronger!');

    this.increaseLevel();
  }

  increaseDefense(amount: number = 1) {
    const actor = this.parent as Actor;
    if (!actor) return;
    actor.fighter.baseDefense += amount;

    window.messageLog.addMessage('Your movements are getting swifter!');

    this.increaseLevel();
  }
}
