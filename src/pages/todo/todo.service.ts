
import { Todo, TYPE_TODO } from './models';
import { BehaviorSubject, Subscription } from 'rxjs';
import { dataService } from '../../modules/data/dataService';
import { saveIntoArray, waitMS } from '../../modules/data/utilsData';
import { ProjectItem } from '../../modules/data/models';
import { todoMiddleware } from './todo.middleware';
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
    const sub = dataService.pouchReady$.subscribe(ready => {
      if(ready) this._init(project, tag);
    });
    this._subscription.push(sub);
  }

  async _init(project: ProjectItem, tag: string) {
    console.log('-------------------------------------------');
    console.log("Init: ", project, TYPE_TODO);
    if(this._project && this._project._id === project._id && 
      this._state.selectedTag === tag) return;

    const showChildren = (tag === 'today' || tag === 'important')? true : false;

    this._state = {...this.state, ...{ selectedTag: tag, showSubTodos: showChildren}};

    await waitMS(500);
    console.log('Loadng new project::: ');
    this._project = project;
    // this._docs = await dataService.getAllByProjectAndType(project.childId, TYPE_TODO);
    // console.log("Init Docs: ", this._docs);
    //this.filterTodos();
    this.reloadTodos();
    todoMiddleware.init();

    //manage changes

    const sub = dataService.subscribeProjectCollectionChanges(project.childId,TYPE_TODO)
      .subscribe((doc: Todo) => {
        console.log("TodoService subscription: ", doc); 
        this.reloadTodos();
        //testing just reload the whole thing
        //this.reloadBaseParent(doc);
      });
    this._subscription.push(sub);

    //load views
    this.loadQueryViews();
  }

  private async reloadBaseParent(todo:Todo){
    console.log("Loading base parent");
    const baseParent = await this.getBaseParent(todo);
    console.log("Base Parent::: ", baseParent);
    if(!baseParent) return this.reloadTodos();

    if(baseParent._deleted){
      this.filterAndSaveTodos(this.state.docs.filter(d => d._id !== todo._id));
    }
    else {
      this.filterAndSaveTodos(saveIntoArray(baseParent, this.state.docs));
    }
    
  }

  private async getBaseParent(todo:Todo){
    if(todo.parent){
      const parent = await dataService.getDoc(todo.parent);
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
    const test = await dataService.pouch.query('todo_index/by_tag',{
      include_docs: true,
    });
    console.log('ALL: ', test)
    const key = ((this.state.showSubTodos)? '':'2') +
                ((this.state.doneTodos)? 1 : 0) + 
                this.state.selectedTag;
    console.log('KEY: ', key);
    const res = await dataService.pouch.query('todo_index/by_tag', {
      include_docs: true,
      key: key
    });
    console.log('=======================');
    console.log(res);
    const docs = res.rows.map(doc => doc.doc);
    this.state = {...this._state, ...{docs: docs}};
  }

  private filterAndSaveTodos(docs: Todo[]):Todo[] {
    const filtered = docs.filter(doc => this.filterFunction(doc));
    this.state = {...this.state, ...{docs: filtered}};
    return filtered;
  }

  private filterFunction(doc:Todo) {
      if (doc.done !== this._state.doneTodos) return false;
      if (doc.parent && !this.state.showSubTodos) return false;
      if(this._state.selectedTag === 'all') return true;
      if(!doc.tags) return false;

      for(let i = 0; i < doc.tags.length; i++){
        if(doc.tags[i] === this._state.selectedTag)
          return true;
      }
      return false;
    
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
      const parentTodo: Todo = await dataService.getDoc(parentId);
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
      const parentTodo: Todo = await dataService.getDoc(parentId);
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
    const res = await dataService.saveInProject({...{done: false}, ...doc}, this._project, 
                              TYPE_TODO, null, null, true, true);
    if(parentId && doc._id) {
      this.addSubTodoToParent(doc._id, parentId)
    }
    console.log(res);
    return res;

  }

  public async remove(id: string) {
    //see if this doc has parent
    try {
      const todo: Todo = await dataService.getDoc(id);
      if (todo) {
        if(todo.parent) {
          this.removeSubTodoFromParent(id, todo.parent);
        }
      }
    }
    catch(e) {
      console.log(e);
    }
    dataService.remove(id, true);
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
    const todos = await dataService.getDocList(list);
    return todos;
  }


  public unsubscribe() {
    if(!this) return;
    this._subscription.forEach(sub => {
      if(sub)
        sub.unsubscribe();
    });
  }

  //load views/indexes
  private async loadQueryViews() {
    const version = 10;
    const doc = await dataService.getDoc('_design/todo_index');

    if(doc && doc.version && doc.version >= version) return; 

    let rev = null;
    if(doc)
      rev = doc._rev;

     // add view filters
     dataService.pouch.put({
      _id: '_design/todo_index',
      version: version,
      _rev: rev,
      views: {
        by_tag: {
          map: function (doc) {
            //console.log('View Function -------------------------: ', doc);
            var i = doc._id.indexOf('|');
            i = doc._id.indexOf('|', i+1)
            var ii = doc._id.indexOf('|', i+1)
            var id = doc._id.substring(i+1, ii);

            if(id !== 'todo') return;

            var done;
            var child;
            if(doc.done){
              done = '1';
            }
            else {
              done = '0';
            }

            if(doc.parent){
              child = '1';
            }
            else {
              child = '2'
            }
            // for 'all' tag
            // @ts-ignore: internal pouch/couch function
            emit(done + 'all');
            if(child == '2'){
              // @ts-ignore: internal pouch/couch function
              emit(child + done + 'all');
            }
            //for all the other tags
            if(doc.tags){
              for(var x = 0; x < doc.tags.length; x++){
                // @ts-ignore: internal pouch/couch function
                emit(done + doc.tags[x]);
                if(child == '2'){
                  // @ts-ignore: internal pouch/couch function
                  emit(child + done + doc.tags[x])
                }
                
              }
            }
            
          }.toString()
        }
      }
    }).then((res) => {
      console.log(res);
    }).catch((err)=> {
      console.log(err);
    });
  }


}



export  const todoService = new TodoService(); 