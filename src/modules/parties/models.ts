import { Doc, ProjectItem } from "../data/models";

export const TYPE_PARTY = 'party';

export enum ChallengeState {
  finished = 'finished',
  current = 'current',
  future = 'future',
  waiting = 'waiting',
  resting = 'resting',
}

export enum ChallengeType {
  checkin = 'Check-In',
  value = 'Value',
  note = 'Note',
  quizz = 'Quizz',
  looser = 'Biggest Looser',
  gainer = 'Biggest Gainer'
}

export enum ChallengeTypeUnit {
  Cup = 'Cup',
  Dollar = "Dollar",
  Page = 'Page',
  Minute = 'Minute',
  Hour = 'Hour',
  Meter = 'Meter',
  Kilometer = 'Kilometer',
  Other = 'Other'
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
  score: {reward: number},
  scoreHistory: {[key:string]: {reward:number}};
}

export interface ChallengeRewards {
  value: number,
  item?: any,
}

export interface ChallengeAction {
  date: string,
  value: number, 
  reward: ChallengeRewards,
  data?: any,
}
export interface ChallengeMember {
  id: string,
  username: string,
  score: {reward: number},
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

  //type
  challengeType: ChallengeType = ChallengeType.checkin;
  challengeTypeUnit: ChallengeTypeUnit = ChallengeTypeUnit.Other;
  chalengeTypeOther: string = '';
  challengePointMultiplier: number = 1;

  chalengeTypeNoteVote: boolean = false;

  //members
  members: ChallengeMember[]  = []

  constructor(values: Object = {}) {
    super()
    Object.assign(this, values);
  }
}
