import { Doc, ProjectItem } from "../data/models";

export const TYPE_PARTY = 'party';

export enum ChallengeState {
  finished = 'finished',
  current = 'current',
  future = 'future',
  waiting = 'waiting',
  resting = 'resting',
}

export enum ChallengeDifficulty {
  trivial, easy, medium, hard, extreme
}

export enum ChallengeIntervals {
  day = 'day',
  week = 'week',
  month = 'month'
}

export interface PartyMember {
  id: string,
  username: string,
  rights: string,
  score: {exp: number},
  scoreHistory: {[key:string]: {exp:number}};
}

export interface ChallengeRewards {
  score: number,
  item?: any,
}

export interface ChallengeAction {
  date: string,
  value: number, 
  reward: ChallengeRewards,
}
export interface ChallengeMember {
  id: string,
  username: string,
  score: {exp: number},
  scoreHistory: {[key:string]: {exp:number}};
  joinDate: number,
  actions: { [key:string]: ChallengeAction },
  lastCalculatedDate?: string,
  currentStreak?: number,
  biggestStreak?: number,

}


export class PartyProject extends ProjectItem {
  type: string = TYPE_PARTY
  secondaryType: string = 'project'
  creator: string = '';
  dirty: number = 0;
  members: PartyMember[]  = []

  moneyTypeSingle: string = 'Ruby';
  moneyTypeMultiple: string =  'Rubies';
  moneyColor: string = '#ff0000'


  constructor(values: Object = {}) {
    super()
    Object.assign(this, values);
  }
}

export class Challenge extends Doc {
  name: string = 'New Challenge';
  note?: string;
  type:string = TYPE_PARTY;
  access: string = ''
  secondaryType: string = 'challenge'
  state: ChallengeState = ChallengeState.waiting;
  difficulty:ChallengeDifficulty = ChallengeDifficulty.medium;
  //regularity
  regularityInterval:ChallengeIntervals = ChallengeIntervals.day;
  regularityIntervalGoal: number = 1;
  regularityEachDayGoal: number = 1;

  //members
  members: ChallengeMember[]  = []

  constructor(values: Object = {}) {
    super()
    Object.assign(this, values);
  }
}
