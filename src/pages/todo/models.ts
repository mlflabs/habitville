import { Doc } from '../../modules/data/models'
import { GamifyRewards } from '../habits/utilsHabits';

export const TYPE_TODO = 'todo';

export class Todo extends Doc {
  title?: string;
  note?: string;
  done?: boolean = false;
  date?: Date
  tags?: string[];

  _new?: boolean; // for saving new docs, temp solution
  //sub tasks
  parent?: string | null = null;
  subTodos?: string[] | null = null;
  showSubTodos?: boolean = false;
  showDone?: boolean = false;

  newRewards?: GamifyRewards;
  doneRewards?: GamifyRewards;



  constructor(values: Object = {}) {
    super()
    Object.assign(this, values);
  }
}