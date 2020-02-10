import React, { useState, useEffect, useReducer } from 'react';
import { IonLabel, IonRow, IonCol, 
        IonIcon, IonGrid, IonBadge, IonButton } from '@ionic/react';
import { Todo } from './models';

import { radioButtonOff, radioButtonOn, sunny, star, heart, basket, construct, arrowDownCircle, arrowForwardCircle, checkmark } from '../../../node_modules/ionicons/icons';
import { printCleanNote, getAction } from '../../utils';
import './todo.component.css'
import { DataFunctions } from './hooks/todos.hook';
import TodoNewComp from './todo.new.component';
import TodoEditInlineComponent from './todo.edit.inline.component';
import { gamifyService } from '../../modules/gamify/gamifyService';

export interface TodoState {
  todo: Todo,
  newSubTitle: string,
  subSelect: Todo|null
  subTodos: Todo[]
}


const reducer = (state, action): TodoState => {
  switch(action.type) {
    case 'fullupdate':
      loadSubtodos(action.data)
      return state; //next action will make a full load
    case 'updateTodo':
      return {...state, ...{todo:action.data}};
    case 'subtodos':
      return {...state, ...{todo: action.data.todo, subTodos: action.data.subTodos}}
    default:
      return state;
  }
}

const loadSubtodos = async (data:{todo:Todo, dispatch, dataFunctions: DataFunctions}) => {
  const {todo, dispatch, dataFunctions} = data;
  console.log('Loading Sub Todos Function: ', todo.subTodos, todo.showSubTodos, todo);
  if(todo.subTodos && todo.showSubTodos && todo.subTodos.length > 0){
    const todos = await dataFunctions.loadSubTodos(todo.subTodos);
    console.log("Loading subtodos ------------: ", todos);
    dispatch(getAction('subtodos', {todo: todo, subTodos:todos}))
  }
}


//Component Start
const TodoListItemComp = ({todo, tags, projectId, selectedTodo, lastChild,  dataFunctions}:
  {todo:Todo, tags:string[], projectId: string, lastChild: boolean,  selectedTodo: Todo|null,  dataFunctions: DataFunctions}) => {
  

  const [state, dispatch] = useReducer(reducer, 
    {todo: todo, subTodos: [], newSubTitle: '', subSelect:null})
  
  const [showSubAddSubtask, setShowSubAddSubtask] = useState(false)

  console.log('STATE TODONAME: ', state.todo.title);
  console.log(state);

  useEffect(() => {
    console.log("UseEffect TODOS-------- "+ todo.title, todo);
    //load our subtodos
    dispatch(getAction('fullupdate', {todo: todo, dispatch, dataFunctions}));
  }, [todo])




  const doneHandler = () => {
    const newDoc = gamifyService.calculateFinishedTodoRewards(
        {...state.todo, ...{done: !state.todo.done}});
    dispatch(getAction('updateTodo', newDoc));
    dataFunctions.save(newDoc);
  }

  const filterHandler = (showDone: boolean) => {
    if(state.todo.showDone === showDone)return;
    const newDoc = {...state.todo, ...{showDone: showDone}};
    dispatch(getAction('updateTodo', newDoc));
    dataFunctions.save(newDoc);
  }

  const showSubTodosHandler = (show: boolean) => {
    console.log("showSubtasks::: ", show, state.todo);
    const newDoc = {...state.todo, ...{showSubTodos: show}};
    dispatch(getAction('updateTodo', newDoc));
    dataFunctions.save(newDoc);
  }

  const handleSelectTodo = (todo:Todo) => {
    if(selectedTodo && todo._id === selectedTodo._id){
      dataFunctions.select(null);
    }
    else {
      dataFunctions.select(todo);
    }
  }

  if(state.todo.subTodos && state.todo.subTodos.length > 0){
    console.log('*****************************************')
    console.log(state.todo.title, state.todo.subTodos);

  }

  const printTag = (tag: string) => {
    if(tag === 'today')
      return (<IonIcon  icon={sunny} key={tag} color="sunny" />);
    if(tag === 'important')
      return (<IonIcon  icon={star} key={tag} color="warning" />); 
    if(tag === 'wish')
      return (<IonIcon  icon={heart} key={tag} color="danger" />); 
    if(tag === 'buy')
      return (<IonIcon  icon={basket} key={tag} color="tertiary" />);
    if(tag === 'projects')
      return (<IonIcon  icon={construct} key={tag} color="medium" />);
    if(tag === 'tasks')
      return (<IonIcon  icon={checkmark} key={tag} color="medium" />);
  }


  
  const printSubtodos = () => {
    console.log("Print subtodos:: ", state.todo.showSubTodos);
    if(!state.todo.showSubTodos) return <></>;

  const amILast = (list: Todo[], me: Todo): boolean => {
    if(list.length === 0) return true;

    if(list[list.length-1]._id === me._id) return true;

    return false;
  }

    return (
      <IonRow class="todoRow">
        <IonCol  size="auto"><div className="bufferColumnParent" ><div className="bufferColumn" /></div></IonCol>
        <IonCol>
          <div>
                <IonButton  color={(state.todo.showDone)? 'light' : 'success'}
                            class="todoHeaderButtons" 
                            onClick={() => filterHandler(false)}
                            fill="clear">Active</IonButton>
                <IonButton  color={(!state.todo.showDone)? 'light' : 'success'}
                            class="todoHeaderButtons" 
                            onClick={() => filterHandler(true)}
                            fill="clear">Done</IonButton>
                <IonButton  color={(showSubAddSubtask)? 'primary': 'light'}
                            class="todoHeaderButtons showAddSubtask" 
                            onClick={() => setShowSubAddSubtask(!showSubAddSubtask)}
                            fill="clear">Add Subtask</IonButton>
          </div>
          
          {(showSubAddSubtask)? (
            <TodoNewComp  parentId={state.todo._id} 
              projectId={projectId} 
              saveFunc={dataFunctions.save} />
          ) : (<></>)}
        

          {state.subTodos.filter(todo => {
            if(!todo.showDone) todo.showDone = false;
            return todo.done === state.todo.showDone
            })
            .map(todo => (
              <TodoListItemComp todo={todo} 
                  tags={tags}
                  selectedTodo={selectedTodo}
                  projectId={projectId}
                  dataFunctions={dataFunctions}
                  lastChild={amILast(state.subTodos, todo)}
                  key={todo._id + "sub"} />
          ))}
        </IonCol>
      </IonRow>
    )
  }

  const printTask = () => {
      return (
          <IonGrid>
            <IonRow class={(state.todo.showSubTodos && !lastChild)? '': 'todoRowBorder'}>
              <IonCol size="auto">
                  {state.todo.done? (
                      <IonIcon  color="dark"  
                                style={{fontSize:'32px', verticalAlign: 'text-top'}}
                                icon={radioButtonOn} onClick={doneHandler} />
                  ) : (
                      <IonIcon  color="dark"
                                style={{fontSize:'32px', verticalAlign: 'text-top'}}
                                icon={radioButtonOff} onClick={doneHandler} />
                  )}
              </IonCol>
              <IonCol class="todoTitleColumn" onClick={() => handleSelectTodo(todo)}  >
                        <IonLabel  class="todoTitle" >
                          {state.todo.title}
                          {(state.todo.subTodos && state.subTodos.length> 0)? (
                            <IonBadge class="todoBadgeSubtodos" color="secondary">
                                {state.subTodos.length}
                            </IonBadge>
                          ) : (<></>)}
                          
                        </IonLabel>
                        {state.todo.note? (
                          <div className="todoNote">
                            {printCleanNote(state.todo.note)}
                          </div>
              
                        ) : (
                            <></>
                        )}
                        {(state.todo.tags && state.todo.tags.length > 0)? (
                          <div className="todoListItemIcons">
                            { state.todo.tags.map(tag => printTag(tag)) }
                          </div>
                        ) : ( <></> )}
                        
              </IonCol>
              <IonCol size="auto" >
                  
                  {state.todo.showSubTodos? (
                    <IonIcon  color="primary"
                              style={{fontSize:'32px', paddingRight:"10px"}}
                              icon={arrowDownCircle}
                              onClick={() => showSubTodosHandler(false)} />

                  ) : (
                    <IonIcon  color="primary"
                              style={{fontSize:'32px', paddingRight:"10px"}}
                              icon={arrowForwardCircle}
                              onClick={() => showSubTodosHandler(true)} />
                  )}
                 
              </IonCol>
              
            </IonRow>
            {(selectedTodo && selectedTodo._id === state.todo._id)? (
              <IonRow>
                <IonCol>
                  <TodoEditInlineComponent 
                          todo={state.todo}
                          tags={tags}
                          dataFunctions={dataFunctions} />
                </IonCol>        
              </IonRow>
            ) : ( <></> )}
            {printSubtodos()}
          </IonGrid>
      )
  }

  return printTask();
};

export default TodoListItemComp;
