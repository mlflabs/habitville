
import { Todo, TYPE_TODO } from './models';
import { BehaviorSubject, Subscription } from 'rxjs';
import { dataService } from '../../modules/data/dataService';
import { saveIntoArray, waitMS } from '../../modules/data/utilsData';
import { ProjectItem } from '../../modules/data/models';
import _ from 'lodash';
import { gamifyService } from '../../modules/gamify/gamifyService';

export interface TodoState {
  selectedTodo: Todo|null,
  selectedTag: string,
  docs: Todo[],
  tags: string[],
  doneTodos: boolean,
  showSubTodos: boolean,
}

export const getInitTodoState = (): TodoState => {
  return {
    selectedTodo:null,
    selectedTag: 'all',
    docs: [],
    tags: ['today', 'tasks', 'important', 'wish', 'buy', 'projects', 'all'],
    doneTodos: false,

    showSubTodos: false,
  }
}


export class TodoService {
  
  // @ts-ignore: it will be initialized in init
  private _project: ProjectItem;

  private _state: TodoState = getInitTodoState();
  
  public state$ = new BehaviorSubject(this._state);

  // private _docs: Todo[] = [];
  
  // public docs$ = new BehaviorSubject(this._docs);

  private _subscription: Array<Subscription> = [];



  public init(project: ProjectItem, tag: string) {
    //first unsubscribe
    this.unsubscribe();
    const dataSub = dataService.getReadySub().subscribe( async (ready) => {
      if(!ready) return;
      
      this._init(project, tag);

      await waitMS(1000);
      dataSub.unsubscribe();
    });
  }

  async _init(project: ProjectItem, tag: string) {
    console.log('-------------------------------------------');
    console.log("Init: ", project, TYPE_TODO);
    if(this._project && this._project.id === project.id && 
      this._state.selectedTag === tag) return;

    const showChildren = (tag === 'today' || tag === 'important')? true : false;

    this._state = {...this.state, ...{ selectedTag: tag, showSubTodos: showChildren}};

    await waitMS(500);
    console.log('Loadng new project::: ');
    this._project = project;

    // console.log("Init Docs: ", this._docs);
    //this.filterTodos();
    this.reloadTodos();
    //todoMiddleware.init();

    //manage changes

    const sub = dataService.subscribeProjectCollectionChanges(project.id,TYPE_TODO)
      .subscribe((doc: Todo) => {
        console.log("TodoService subscription: ", doc); 
        this.reloadTodos();
        //testing just reload the whole thing
        //this.reloadBaseParent(doc);
      });
    this._subscription.push(sub);

  }

  private async reloadBaseParent(todo:Todo){
    console.log("Loading base parent");
    const baseParent = await this.getBaseParent(todo);
    console.log("Base Parent::: ", baseParent);
    if(!baseParent) return this.reloadTodos();

    if(baseParent.deleted){
      this.filterAndSaveTodos(this.state.docs.filter(d => d.id !== todo.id));
    }
    else {
      this.filterAndSaveTodos(saveIntoArray(baseParent, this.state.docs));
    }
    
  }

  private async getBaseParent(todo:Todo){
    if(todo.parent){
      const parent = await dataService.getDoc(todo.parent, TYPE_TODO);
      if(!parent) {
        return null;
      }

      if(parent.parent){
        return this.getBaseParent(parent);
      }
      else {
        return parent;
      }
    }
    else {
      return todo;
    }
  }

  private async reloadTodos() {
    console.log('State: ', this.state);
    const docs = await dataService.queryByProperty('tags', 'equals', 
      this.state.selectedTag, TYPE_TODO);
    console.log('DOCS::: ', docs);
    this.filterAndSaveTodos(docs);
  }

  private filterAndSaveTodos(docs: Todo[]):Todo[] {
    const filtered = docs.filter(doc => this.filterDoneParentFunction(doc));
    this.state = {...this.state, ...{docs: filtered}};
    return filtered;
  }

  private filterDoneParentFunction(doc:Todo) {
      console.log('Filter1: ', doc.done !== this._state.doneTodos)
      if (doc.done !== this._state.doneTodos) return false;
      if (doc.parent && !this.state.showSubTodos) return false;
      return true;
  }


 
  public get state(): TodoState {
    return this._state;
  }
  public set state(value: TodoState) {
    console.log('State: ', value);
    this._state = value;
    this.state$.next(this._state);
  }

  public async addSubTodoToParent (todoId: string, parentId: string) {
    try {
      const parentTodo: Todo = await dataService.getDoc(parentId, TYPE_TODO);
      if (parentTodo) {
        if(!parentTodo.subTodos) parentTodo.subTodos = [];
        parentTodo.subTodos = _.concat(parentTodo.subTodos, todoId);
        this.save(parentTodo);
      }
    }
    catch(e) {
      console.log(e);
    }
  }

  public async removeSubTodoFromParent (todoId: string, parentId) {
    try {
      const parentTodo: Todo = await dataService.getDoc(parentId, TYPE_TODO);
      if (parentTodo) {
        if(!parentTodo.subTodos) parentTodo.subTodos = [];
        parentTodo.subTodos = _.filter(parentTodo.subTodos, t=>t!== todoId);
        this.save(parentTodo);
      }
    }
    catch(e) {
      console.log(e);
    }
  }


  public async save(doc:Todo, parentId: string|null = null) {
    console.log("------- Save: ", doc, this._project, TYPE_TODO);
    //see if its new
    if(doc._new) {
      delete(doc._new);
      doc.tags = [];
      if(this.state.selectedTag !== 'all'){
        doc.tags.push(this.state.selectedTag); 
      }
      else {
        doc.tags.push('tasks');
      }
      doc = gamifyService.calculateNewTodo(doc);
    }
    const res = await dataService.save({...{done: false}, ...doc}, TYPE_TODO, {project: this._project});
    if(parentId && doc.id) {
      this.addSubTodoToParent(doc.id, parentId)
    }
    console.log(res);
    return res;

  }

  public async remove(id: string) {
    //see if this doc has parent
    try {
      const todo: Todo = await dataService.getDoc(id, TYPE_TODO);
      if (todo) {
        if(todo.parent) {
          this.removeSubTodoFromParent(id, todo.parent);
        }
      }
    }
    catch(e) {
      console.log(e);
    }
    dataService.remove(id, TYPE_TODO);
  }

  public select(doc:Todo | null) {
    this.state = {...this._state, ...{ selectedTodo: doc} };
  }

  public changeDoneFilter(done: boolean) {
    if(done === this._state.doneTodos) return;
    this._state = {...this._state, ...{ doneTodos: done} };
    this.reloadTodos();

  }

  public changeShowSubtodosFilter(show: boolean) {
    if(show === this._state.showSubTodos) return;
    this._state = {...this._state, ...{ showSubTodos: show} };
    this.reloadTodos();
  }

  public selectTag(tag:string) {
    if(tag === this._state.selectedTag) return;
    this._state = {...this._state, ...{ selectedTag: tag} };
    this.reloadTodos();
  }

  public async loadTodoList (list:string[]): Promise<Todo[]> {
    const todos = await dataService.getBulk(list, TYPE_TODO);
    return todos;
  }


  public unsubscribe() {
    if(!this) return;
    this._subscription.forEach(sub => {
      if(sub)
        sub.unsubscribe();
    });
  }

}



export  const todoService = new TodoService(); 