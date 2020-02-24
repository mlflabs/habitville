
import { Todo, TYPE_TODO, TodoList, TYPE_TODO_LIST, TodoTag, TYPE_TODO_TAG, getDefaultTodoList, getDefaultTodoTag } from './models';
import { BehaviorSubject, Subscription } from 'rxjs';
import { dataService } from '../../modules/data/dataService';
import { waitMS, getProjectChildId } from '../../modules/data/utilsData';
import _ from 'lodash';
import { gamifyService } from '../../modules/gamify/gamifyService';
import ulog from 'ulog';
import { toastService } from '../../modules/toast/toastService';
import sun from '../../icons/sun.json'
import star from '../../icons/star.json'

const log = ulog('todo');


export interface TodoState {
  selectedTodo: Todo|null,
  list: TodoList|undefined,
  tag: TodoTag|undefined,
  docs: Todo[],
  tagDocs: TodoTag[],
  doneTodos: boolean,
}



export const getInitTodoState = (): TodoState => {
  return {
    selectedTodo:null,
    list: undefined,
    tag: undefined,
    docs: [],
    tagDocs: [],
    doneTodos: false,
  }
}


export class TodoService {
  
  // @ts-ignore: it will be initialized in init
  private _projectid: string;
  private _state: TodoState = getInitTodoState();
  public state$ = new BehaviorSubject(this._state);
  private _subscription: Array<Subscription> = [];

  public init(projectid: string, list:string|undefined, tag:string|undefined) {
    log.warn(projectid, list, tag);
    //first unsubscribe
    this.unsubscribe();
    const dataSub = dataService.getReadySub().subscribe( async (ready) => {
      if(!ready) return;
      
      this._init(projectid, list, tag);

      await waitMS(1000);
      dataSub.unsubscribe();
    });
  }

  async _init(projectid: string, listName: string|undefined, tagName: string|undefined) {
    console.log('-------------------------------------------');
    console.log("Init: ", projectid, TYPE_TODO);

    if(this._projectid  === projectid && 
        this._state.list?.fullname === listName && 
        this._state.tag?.fullname === tagName) return;

    let list, tag
    if(!listName && !tagName){
      list = getDefaultTodoList('default', projectid)     
    }
    if(listName)
      list = getDefaultTodoList(listName, projectid)    
    if(tagName)
      tag = getDefaultTodoTag(tagName, projectid);



    this._state = {...this.state, ...{
      tag, 
      list,
      tagDocs: this.getTags(projectid)}};
    
      log.warn(this._state);
    
    this._projectid = projectid;
    
    log.info(this.state);

    this.reloadTodos();

    const sub = dataService.subscribeProjectCollectionChanges(projectid,TYPE_TODO)
      .subscribe((doc: Todo) => {
        log.log("TodoService subscription: ", doc); 
        this.reloadTodos();
      });
    this._subscription.push(sub);

  }

  async reloadTodos() {
    log.info('RELOADING TODOS::: ', this.state)
      let docs;
    if(this.state.list){
        log.info('Todo Query by List')
        docs = await dataService.queryByProperty(
          'list', 'equals', this.state.list.fullname, TYPE_TODO);
    }
     else if(this.state.tag){
        log.info('Todo Query by Tags')
        docs = await dataService.queryByProperty(
          'tags', 'equals', this.state.tag.fullname, TYPE_TODO);
    }

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
    console.log("------- Save: ", doc, this._projectid, TYPE_TODO);
    //see if its new
    if(doc._new) {
      delete(doc._new);
      doc.tags = [];
      if(this.state.list)
        doc.list = this.state.list.fullname;
      else
        doc.list = getProjectChildId(this._projectid)+'default'
      if(!doc.tags){
        doc.tags = [];
      }
      if(this.state.tag)
        doc.tags.push(this.state.tag.fullname)
     
        

      doc = gamifyService.calculateNewTodo(doc);
    }
    const res = await dataService.save({...{done: false}, ...doc}, TYPE_TODO, {projectid: this._projectid});
    if(parentId && doc.id) {
      this.addSubTodoToParent(doc.id, parentId)
    }
    console.log(res);
    return res;

  }

  public async saveList(doc:TodoList) {
    log.info('Save New TodoList: ', doc);
    if(doc._new) {
      //make sure its not a duplicate
      const res = await dataService.getDoc(doc.id, TYPE_TODO_LIST);
      if(res){
        //error, its a duplicate
        toastService.printSimpleError('List Already Exists');
        return;
      }
      delete doc._new;;
      const saveRes = await dataService.save(doc, TYPE_TODO_LIST);
      log.info(saveRes);
      return saveRes;
    }
  }

  public async deleteList(list:TodoList) {
    //get all docs that are in this list
    log.warn(list);
    const docs = await dataService.queryByProperty('list', 'equals', list.fullname,TYPE_TODO);
    log.warn(docs);
    //delete all items
    for(let i = 0; i < docs.length; i ++){
      dataService.remove(docs[i].id, TYPE_TODO);
    }
    if(list.id)
      dataService.remove(list.id, TYPE_TODO_LIST);
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

  public getTags(projectid):TodoTag[] {
    const today =  {
        type: TYPE_TODO_TAG,
        id:'',
        name: 'today',
        fullname: getProjectChildId(projectid) + 'today',
        icon: 'sun.svg',
        animatedIcon: sun,
      };
    today.fullname = getProjectChildId(projectid) + 'today';
    const important ={
        id:'',
        type: TYPE_TODO_TAG,
        name: 'important',
        fullname: getProjectChildId(projectid) + 'important',
        icon: 'star.svg',
        animatedIcon: star,
      };
    today.fullname = getProjectChildId(projectid) + 'today';
    //console.log(today, important);
    const tags =  [today, important];
    console.log(tags);
    return tags;
  }


  public selectList(list:TodoList) {
    if(list === this._state.list) return;
    this._state = {...this._state, ...{ list } };
    this.reloadTodos();
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