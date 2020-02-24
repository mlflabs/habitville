import { Doc } from '../../modules/data/models'
import { GamifyRewards, getInitGamifyRewards } from '../habits/utilsHabits';
import { getProjectChildId } from '../../modules/data/utilsData';

export const TYPE_TODO = 'todo';
export const TYPE_TODO_LIST = 'todolist';
export const TYPE_TODO_FOLDER = 'todoFolder';
export const TYPE_TODO_TAG = 'todoTag';

export const FOLDER_BASE_POSITION = 'base';

export const getDefaultTodoList = (name:string = 'tasks', projectid:string):TodoList => {
  const project = getProjectChildId(projectid);
  return new TodoList({
    id: undefined,
    folder: undefined,
    type: TYPE_TODO_LIST,
    icon: 'check',
    secondaryType: TYPE_TODO_LIST,
    name,
    fullname: project + name,
  })
}

export class TodoList extends Doc {
  folder: string = FOLDER_BASE_POSITION;
  type: string = TYPE_TODO_LIST;
  project?: string;
  icon?:string;
  color?:string;
  _new?: boolean;
  fullname:string;
  secondaryType:'todolist'|'todoFolder'  = TYPE_TODO_LIST

  constructor(values: Object = {}) {
    super();
    Object.assign(this, values);
    this.fullname = values['fullname'];
  }
}

export const getDefaultTodoTag = (name:string = 'tasks', projectid:string, icon:string ='check'):TodoTag => {
  const project = getProjectChildId(projectid);
  return new TodoTag({
    id: undefined,
    type: TYPE_TODO_TAG,
    icon,
    name,
    fullname: project + name,
  })
}

export class TodoTag extends Doc {
  type: string = TYPE_TODO_TAG;
  icon?:string;
  animatedIcon?:any;
  color?:string;
  _new?: boolean;
  fullname!: string;
  constructor(values: Object = {}) {
    super();
    Object.assign(this, values);
    //this.fullname = values['fullname'];
  }
}

export class Todo extends Doc {
  note?: string;
  type: string = TYPE_TODO;

  done: boolean;
  date: number|null;
  list: string = 'default';
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