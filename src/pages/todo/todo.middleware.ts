
import { Todo } from './models';

//TODO: start generating stats


class TodoMiddleware {

  public init() {
    console.log('TODO Middleware')


  }



  async checkSubTodoState(todo:Todo) {
    
    // deleted
    if(todo.deleted) {
      
    }
    // has changes to parent
    
    // changes to child
  }
}


export const todoMiddleware = new TodoMiddleware();

