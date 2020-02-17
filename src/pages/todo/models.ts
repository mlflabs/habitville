import { Doc } from '../../modules/data/models'
import { GamifyRewards, getInitGamifyRewards } from '../habits/utilsHabits';

export const TYPE_TODO = 'todo';

export class Todo extends Doc {
  name?: string;
  note?: string;
  type: string = TYPE_TODO;

  done: boolean;
  date: number|null;
  tags: string[];


  _new?: boolean; // for saving new docs, temp solution
    //sub tasks
  parent: string | null;
  subTodos: string[];
  showSubTodos: boolean;
  showDone: boolean;

  newRewards: GamifyRewards;
  doneRewards: GamifyRewards;
  
  constructor(values: Object = {}) {
    super();
    this.done = false;
    this.date = null;
    this.tags = [];
    this.parent = null;
    this.subTodos = [];

    this.showSubTodos = false;
    this.showDone = false;

    this.newRewards = getInitGamifyRewards();
    this.doneRewards = getInitGamifyRewards();
    
    Object.assign(this, values);

  }
}