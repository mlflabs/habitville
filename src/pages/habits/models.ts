
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


export interface HabitAction {
  value: number, 
  date:string, 
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
  regularityIntervalGoal: number = 1;
  regularityEachDayGoal: number = 1;

  actions: {[key: string]: HabitAction } = {};
  //streaks
  //member info
  lastCalculatedDate?:string;
  currentTimeperiedStreak: number = 0;
  currentTimeperiodLastDay?: string;

  currentStreak: number = 0;
  biggestStreak: number = 0;

  newRewards?: GamifyRewards;
  
  constructor(values: Object = {}) {
    super()
    Object.assign(this, values);
  }
}


