import React from 'react';
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonButton} from '@ionic/react';

import TodoNewComp from './todo.new.component';
import TodoListItemComp from './Todo.listitem.component';
import { dataService } from '../../modules/data/dataService';
import { useTodosCollectionFacade } from './hooks/todos.hook';
import './todos.page.css';
import HeaderWithProgress from '../../components/HeaderWithProgress';
import { useParams } from 'react-router-dom';
import { capitalize } from '../../utils';
import { getDefaultProject } from '../../modules/data/utilsData';
import { authService } from '../../modules/auth/authService';

const TodosPage  = () => {

  const project = getDefaultProject(authService.userid);

  const { tag } = useParams();
  const selectedTag = tag || 'tasks';
  console.log('TAG::: ', selectedTag);
  const [state, dataFunc] = useTodosCollectionFacade(project, selectedTag)
  const { docs, selectedTodo, tags } = state;

  console.log(docs);
  // dataFunc.selectTag(tag? tag: 'all')

  const printTitle = ():string => {
    if(tag){
      return 'Todos: ' + capitalize(tag);
    }
    return 'Todos';
    
  }


  return (
    <IonPage>
      <HeaderWithProgress title={printTitle()} />
      <IonContent id="todoContent">
        
        <IonItem>  
          <TodoNewComp parentId ={undefined} 
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
          <IonButton  color={(!state.showSubTodos)? 'light':'tertiary'} 
                      class="todoHeaderButtons" 
                      onClick={() => {dataFunc.changeShowSubTodosFilter(true)}}
                      fill="clear">Show Children</IonButton>
          <IonButton  color={(state.showSubTodos)? 'light':'tertiary'} 
                      class="todoHeaderButtons" 
                      onClick={() => {dataFunc.changeShowSubTodosFilter(false)}}
                      fill="clear">Only Parents</IonButton>
        </div>
        <IonList>
            {docs.map(todo => (
              <TodoListItemComp   todo={todo} 
                                  tags={tags}
                                  lastChild = {false}
                                  selectedTodo={selectedTodo}
                                  projectId = {project.id}
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

