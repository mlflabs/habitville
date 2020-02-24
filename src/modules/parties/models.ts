import { Doc, ProjectItem } from "../data/models";

export const TYPE_PARTY = 'party';

export enum ChallengeStage {
  'finished',
  'current',
  'future',
  'waiting',
  'resting',
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
  rights: string
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
  stage: ChallengeStage = ChallengeStage.waiting;
  difficulty:ChallengeDifficulty = ChallengeDifficulty.medium;
  //regularity
  regularityInterval:ChallengeIntervals = ChallengeIntervals.day;
  regularityValue: number = 1;
  regularityEachDayGoal?: number = 1;

  //members
  members: PartyMember[]  = []

  constructor(values: Object = {}) {
    super()
    Object.assign(this, values);
  }
}
