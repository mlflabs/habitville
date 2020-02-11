import { useEffect, useState, useRef } from 'react';
import { Subscription } from 'rxjs';
import { ProjectItem } from '../../../modules/data/models';
import { Todo } from '../models';
import { TodoService, TodoState, getInitTodoState } from '../todo.service';


export interface DataFunctions {
  save: {(doc: Todo, parentId?: string|null):Promise<any>},
  remove: {(id: string)},
  select: {(doc: Todo | null)},
  selectTag: {(tag: string)},
  loadSubTodos: {(list: string[])},
  changeDoneFilter: {(done:boolean)},
  changeShowSubTodosFilter: {(show:boolean)}
}


//more simpler then auth hook, just read data
export function useTodosCollectionFacade(project: ProjectItem, tag: string): 
                                        [TodoState, DataFunctions]{
                                
  const [state, setState] = useState(getInitTodoState());
  const todoService = useRef(new TodoService());

  todoService.current.selectTag(tag);
  
          
  const dataFunctions = {
    save: (doc: Todo, parentId?: string|null):Promise<any> => todoService.current.save(doc, parentId),
    remove: (id) => todoService.current.remove(id), //TODO: allow user to choose, sync or not to sync
    select: (doc: Todo | null) => todoService.current.select(doc),
    selectTag: (tag: string) => todoService.current.selectTag(tag),
    loadSubTodos: (ids: string[]): Promise<Todo[]> => todoService.current.loadTodoList(ids),
    changeDoneFilter: (done:boolean) => todoService.current.changeDoneFilter(done),
    changeShowSubTodosFilter: (show: boolean) => todoService.current.changeShowSubtodosFilter(show),
  }

  useEffect(() => {
    console.log('TODOS HOOK - UseEffect NEW SERVICE------------------------------');
    todoService.current.init(project, tag)

    return todoService.current.unsubscribe;
  }, [project.id])

  useEffect(() => {
    const subscriptions: Subscription[] = [
      todoService.current.state$.subscribe(state => {
        console.log('TODO Hook Sub: ', state);
        setState(state);
      })
    ];
    return () => { subscriptions.map(it => it.unsubscribe()) };
  },[project.id]);


  return [state, dataFunctions];
}