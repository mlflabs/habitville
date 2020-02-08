
import { dataService } from '../../modules/data/dataService';
import { extractTypeCollectionFromDocId } from '../../modules/data/utilsData';
import { TYPE_TODO } from '../todo/models';
import { Todo } from './models';

//TODO: start generating stats


class TodoMiddleware {

  public init() {
    console.log('TODO Middleware')


  }



  async checkSubTodoState(todo:Todo) {
    
    // deleted
    if(todo._deleted) {
      
    }
    // has changes to parent
    
    // changes to child
  }
}


export const todoMiddleware = new TodoMiddleware();

