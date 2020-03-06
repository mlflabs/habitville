import { useEffect, useState, useRef } from 'react';
import { Subscription } from 'rxjs';
import { Todo, TodoList } from '../models';
import { TodoService, TodoState, getInitTodoState } from '../todo.service';
import ulog from 'ulog';

const log = ulog('todo');

export interface DataFunctions {
  save: {(doc: Todo, parentId?: string|null):Promise<any>},
  remove: {(id: string)},
  select: {(doc: Todo | null)},
  selectList: {(list: TodoList)},
  changeDoneFilter: {(done:boolean)}
  changeOrderFilter: {(type: string)},
  showNewTag: {(show:boolean)}
}


//more simpler then auth hook, just read data
export function useTodosCollectionFacade(
  projectid: string| undefined, list:string|undefined, tag:string|undefined): 
  [TodoState, DataFunctions]{
  
  log.warn(projectid, list, tag);
                           
  if(!projectid) throw new Error('Projectid can not be undefined');
  const [state, setState] = useState(getInitTodoState());
  const todoService = useRef(new TodoService());
          
  const dataFunctions = {
    save: (doc: Todo, parentId?: string|null):Promise<any> => todoService.current.save(doc, parentId),
    remove: (id) => todoService.current.remove(id), //TODO: allow user to choose, sync or not to sync
    select: (doc: Todo | null) => todoService.current.select(doc),
    selectList: (list: TodoList) => todoService.current.selectList(list),
    changeDoneFilter: (done:boolean) => todoService.current.changeDoneFilter(done),
    changeOrderFilter: (filter:string) => todoService.current.changeOrderFilter(filter),
    showNewTag: (show:boolean) => todoService.current.showNewTagFilter(show),
  }

  useEffect(() => {
    todoService.current.init(projectid, list, tag)
    return todoService.current.unsubscribe;
  }, [projectid, list, tag])

  useEffect(() => {
    const subscriptions: Subscription[] = [
      todoService.current.state$.subscribe(state => {
        setState(state);
      })
    ];
    return () => { subscriptions.map(it => it.unsubscribe()) };
  },[projectid]);


  return [state, dataFunctions];
}