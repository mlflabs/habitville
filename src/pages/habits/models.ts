
import { Doc } from '../../modules/data/models'
import { GamifyRewards } from './utilsHabits';

export const TYPE_HABBIT = 'hab';
export const MOMENT_DATE_FORMAT = 'YYYYMMDD';

export enum habitStage {
  'finished',
  'current',
  'future',
  'resting'
}

export enum habitIntervals {
  day = 'day',
  week = 'week',
  month = 'month'
}

export enum habitDifficulty {
  trivial, easy, medium, hard, extreme
}

export const printDifficulty = (hab:habitDifficulty):string => {
  switch(hab) {
    case habitDifficulty.trivial:
      return 'trivial'; // , easy peasy lemon squeezy
    case habitDifficulty.easy:
      return 'easy'; //Piece of Cake , Smooth Sailin'
    case habitDifficulty.medium:
      return 'medium'; //Let's Go
    case habitDifficulty.hard:
      return 'hard'; //No Pain, No Gain
    case habitDifficulty.extreme:
      return 'extreme'; //Death Wish
  }
}


export interface HabitProgress {
  date:string, 
  value: number, 
  reward?: GamifyRewards,
}

export class Habit extends Doc {
  name: string = 'New habit';
  note?: string;
  type:string = TYPE_HABBIT;
  stage: habitStage = habitStage.current;
  difficulty:habitDifficulty = habitDifficulty.medium;
  //regularity
  regularityInterval:habitIntervals = habitIntervals.day;
  regularityValue: number = 1;
  regularityEachDayGoal?: number = 1;

  progress: HabitProgress[] = [];
  //streaks
  currentStreak: number = 0;
  bestStreak: number = 0;

  newRewards?: GamifyRewards;
  
  constructor(values: Object = {}) {
    super()
    Object.assign(this, values);
  }

}
