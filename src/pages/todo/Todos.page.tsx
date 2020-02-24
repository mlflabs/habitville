import React from 'react';
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonButton} from '@ionic/react';
import TodoNewComp from './todo.new.component';
import TodoListItemComp from './Todo.listitem.component';
import { useTodosCollectionFacade } from './hooks/todos.hook';
import './todos.page.css';
import HeaderWithProgress from '../../components/HeaderWithProgress';
import { useParams, useLocation } from 'react-router-dom';
import { capitalize } from '../../utils';
import { getDefaultProject } from '../../modules/data/utilsData';
import { authService } from '../../modules/auth/authService';
import ulog from 'ulog';

const log = ulog('todo');


const TodosPage  = () => {

  const project = getDefaultProject(authService.userid);
  const location = useLocation();
  

  let list, tag;
  const params = useParams();
  log.info(params, location);
  if(location.pathname.startsWith('/todos/tag/')){
   tag = params['tag']
  }
  else {
    list = params['list']
  }

  
  console.log('LIST::: ', list);
  const [state, dataFunc] = useTodosCollectionFacade(project.id, list, tag)
  const { docs, selectedTodo, tagDocs } = state;

  console.log(docs);
  // dataFunc.selectTag(tag? tag: 'all')

  const printTitle = ():string => {
    if(state.list){
      return 'Todos: ' + capitalize(state.list.name);
    }
    return 'Todos';
  }


  return (
    <IonPage>
      <HeaderWithProgress title={printTitle()} />
      <IonContent id="todoContent">
        
        <IonItem>  
          <TodoNewComp 
                       list = {state.list}
                       tag = {undefined}
                       projectId={project.id||''} 
                       saveFunc={dataFunc.save} />
        </IonItem>
        <div>
          <IonButton  color={(state.doneTodos)? 'light':'success'} 
                      class="todoHeaderButtons" 
                      onClick={() => {dataFunc.changeDoneFilter(false)}}
                      fill="clear">Active</IonButton>
          <IonButton  color={(!state.doneTodos)? 'light':'success'} 
                      class="todoHeaderButtons" 
                      onClick={() => {dataFunc.changeDoneFilter(true)}}
                      fill="clear">Finished</IonButton>
        </div>
        <IonList>
            {docs.map(todo => (
              <TodoListItemComp   todo={todo} 
                                  tagDocs={tagDocs}
                                  lastChild = {false}
                                  selectedTodo={selectedTodo}                                 
                                  dataFunctions={dataFunc}
                                  key={todo.id} />
            ))}
        </IonList>
        


        {/*(selectedTodo )? (
          <div className="floating-menu">
            <TodoEditComponent todo={selectedTodo} tags={tags} dataFunctions={dataFunc} />
          </div>
        ) : (
          <></>
        )*/}

      </IonContent>
    </IonPage>
  );
};

export default TodosPage;

