import React, { useState, useEffect, useReducer } from 'react';
import { IonLabel, IonRow, IonCol, 
        IonIcon, IonGrid, IonButton } from '@ionic/react';
import { Todo } from './models';
import _ from 'lodash';
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
      console.log('Action DATA: ', action);
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
  {todo:Todo, tags:string[], projectId: string|undefined, lastChild: boolean,  selectedTodo: Todo|null,  dataFunctions: DataFunctions}) => {
  

  const [state, dispatch] = useReducer(reducer, 
    {todo: todo, subTodos: [], newSubTitle: '', subSelect:null})
  
  const [showSubAddSubtask, setShowSubAddSubtask] = useState(false)

  console.log('STATE TODONAME: ', state.todo.name);
  console.log(state);

  useEffect(() => {
    console.log("UseEffect TODOS-------- "+ todo.name, todo);
    //load our subtodos
    dispatch(getAction('fullupdate', {todo: todo, dispatch, dataFunctions}));
  }, [todo, dataFunctions])




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

  const showSubTodosHandler = () => {
    const newDoc = {...state.todo, ...{showSubTodos: !state.todo.showSubTodos}};
    dispatch(getAction('updateTodo', newDoc));
    dataFunctions.save(newDoc);
  }

  const handleSelectTodo = (todo:Todo) => {
    if(selectedTodo && todo.id === selectedTodo.id){
      dataFunctions.select(null);
    }
    else {
      dataFunctions.select(todo);
    }
  }

  if(state.todo.subTodos && state.todo.subTodos.length > 0){
    console.log('*****************************************')
    console.log(state.todo.name, state.todo.subTodos);

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

  const printTagEdit = (tag: string) => {
    const color = (_.includes(state.todo.tags,tag))? 'primary': 'light';
    if(tag === 'today')
      return (<IonButton class="todoEditInlineIconScrollChild" size="small" key={tag} 
                  fill="clear" color={color} onClick={() => handleTagChange(tag)}>
                  <IonIcon  icon={sunny} />
              </IonButton>);
    if(tag === 'important')
      return (<IonButton class="todoEditInlineIconScrollChild" size="small" key={tag} fill="clear" color={color} onClick={() => handleTagChange(tag)}>
                  <IonIcon  icon={star} />
              </IonButton>); 
    if(tag === 'tasks')
    return (<IonButton class="todoEditInlineIconScrollChild" size="small" key={tag} fill="clear" color={color} onClick={() => handleTagChange(tag)}>
                <IonIcon  icon={checkmark} />
            </IonButton>);
    if(tag === 'wish')
      return (<IonButton class="todoEditInlineIconScrollChild" size="small" key={tag} fill="clear" color={color} onClick={() => handleTagChange(tag)}>
                <IonIcon  icon={heart} />
            </IonButton>); 
    if(tag === 'buy')
      return (<IonButton class="todoEditInlineIconScrollChild" size="small" key={tag} fill="clear" color={color} onClick={() => handleTagChange(tag)}>
              <IonIcon  icon={basket} />
          </IonButton>);
    if(tag === 'projects')
      return (<IonButton class="todoEditInlineIconScrollChild" size="small" key={tag} fill="clear" color={color} onClick={() => handleTagChange(tag)}>
              <IonIcon  icon={construct} />
          </IonButton>);
  }


  const handleTagChange = (tag: string) => {
    if(!state.todo.tags) state.todo.tags = [];

    const res = _.find(state.todo.tags, t=>t===tag);
    let newtags;
    if(_.isUndefined(res)){
      newtags = _.concat(state.todo.tags, tag);
    }
    else {
      newtags = _.filter(state.todo.tags, t=>t!==tag);
    }
    dataFunctions.save(Object.assign(state.todo, {tags: newtags}));
  }

  
  const printSubtodos = () => {
    console.log("Print subtodos:: ", state.todo.showSubTodos);
    if(!state.todo.showSubTodos) return <></>;

  const amILast = (list: Todo[], me: Todo): boolean => {
    console.log('amILast');
    if(list.length === 0) return true;

    if(list[list.length-1].id === me.id) return true;

    return false;
  }

    return (
      <>
      <IonRow>
        <IonCol>
          <div className="todoEditInlineIconScrollParent">
            { tags.map(tag => printTagEdit(tag)) }
          </div>
        </IonCol>
      </IonRow>
      <IonRow class="todoRow">
        <IonCol  size="auto">
          <div className="bufferColumnParent" >
            <div className="bufferColumn" />
          </div>
        </IonCol>
        <IonCol>
          <div>
            {(state.todo.showDone)? (
              <IonButton  color={'success'}
                class="todoHeaderButtons" 
                onClick={() => filterHandler(false)}
                fill="clear">Switch to Active</IonButton>
            ) : (
              <IonButton  color={'success'}
                class="todoHeaderButtons" 
                onClick={() => filterHandler(true)}
                fill="clear">Switch to Done</IonButton>
            )}
            {(selectedTodo && selectedTodo.id === state.todo.id)? (
              <IonButton  color={'success'}
                class="todoHeaderButtons" 
                onClick={() => handleSelectTodo(state.todo)}
                fill="clear">Hide Edit</IonButton>
            ) : (
              <IonButton  color={'success'}
                class="todoHeaderButtons" 
                onClick={() => handleSelectTodo(state.todo)}
                fill="clear">Edit</IonButton>
            )}
            {/*
            {(!showSubAddSubtask)? (
              <IonButton  color={'primary'}
                class="todoHeaderButtons" 
                onClick={() => setShowSubAddSubtask(!showSubAddSubtask)}
                fill="clear">Show Add Subtask</IonButton>
            ) : (
              <IonButton  color={'success'}
                class="todoHeaderButtons" 
                onClick={() => setShowSubAddSubtask(!showSubAddSubtask)}
                fill="clear">Hide Add SubTasks</IonButton>
            )}
            */}
          </div>
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
                  key={todo.id + "sub"} />
          ))}
        </IonCol>
      </IonRow>
      <IonRow>
        <IonCol size="auto">
          <div className="bufferColumnParent" >
            <div className="bufferAddTaskColumn" />
          </div></IonCol>
        <IonCol>
            <TodoNewComp  parentId={state.todo.id} 
              projectId={projectId} 
              saveFunc={dataFunctions.save} />
        </IonCol>
      </IonRow>
    </>
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
              <IonCol class="todoTitleColumn" onClick={() => showSubTodosHandler()}  >
                        <IonLabel  class="todoTitle" >
                          {state.todo.name}
                          {/*
                          {(state.todo.subTodos && state.subTodos.length > 0)? (
                            <IonBadge class="todoBadgeSubtodos" color="secondary">
                                {state.subTodos.length}
                            </IonBadge>
                          ) : (<></>)}
                        */}
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
                              onClick={() => showSubTodosHandler()}
                              icon={arrowDownCircle} />

                  ) : (
                    <IonIcon  color="primary"
                              style={{fontSize:'32px', paddingRight:"10px"}}
                              onClick={() => showSubTodosHandler()}
                              icon={arrowForwardCircle} />
                  )}
                 
              </IonCol>
              
            </IonRow>
            {(selectedTodo && selectedTodo.id === state.todo.id)? (
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
