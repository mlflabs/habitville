import React, { useEffect, useReducer } from 'react';
import { IonLabel, IonRow, IonCol, 
        IonIcon, IonGrid, IonItem, IonText, IonAvatar } from '@ionic/react';
import { Todo, TodoTag } from './models';
import _ from 'lodash';
import './todo.component.css'
import { DataFunctions } from './hooks/todos.hook';
import TodoEditInlineComponent from './todo.edit.inline.component';
import { gamifyService } from '../../modules/gamify/gamifyService';
import ulog from 'ulog'
import check from '../../icons/check.json';
import restart from '../../icons/restart.json'
import AnimatedIcon from '../../components/animatedIcon';
import { COLOR_SUCCESS } from '../../colors';

const log = ulog('todo');

export interface TodoState {
  todo: Todo,
}


const reducer = (state, {type, payload}): TodoState => {
  switch(type) {
    case 'updateTodo':
      return {...state, ...{todo:payload}};
    
    default:
      return state;
  }
}


//Component Start
const TodoListItemComp = ({todo, tagDocs, selectedTodo, dataFunctions}:
  {todo:Todo, tagDocs:TodoTag[], lastChild: boolean,  selectedTodo: Todo|null,  dataFunctions: DataFunctions}) => {
  

  const [state, _dispatch] = useReducer(reducer, 
    {todo: todo, })

  useEffect(() => {
    dispatch('updateTodo', todo);
  }, [todo])
  
  const dispatch = (type:'updateTodo'|
                          'any', 
                    payload:any = {}) => {
    _dispatch({type, payload});
  }
  
  const doneHandler = () => {
    const newDoc = gamifyService.calculateFinishedTodoRewards(
        {...state.todo, ...{done: !state.todo.done}});
    dispatch('updateTodo', newDoc);
    dataFunctions.save(newDoc);
  }

  const handleSelectTodo = () => {
    if(selectedTodo && state.todo.id === selectedTodo.id){
      dataFunctions.select(null);
    }
    else {
      dataFunctions.select(state.todo);
    }
  }

  

  const printSmallTagFromName = (name:string) => {
    //log.warn(tagDocs);
    const tag = tagDocs.find(t => t.name === name);
    if(tag && tag.icon) {
      return <IonIcon  
                class="todoListItemTagIcon"
                key={tag.name}
                size="small" 
                color='success' 
                src={"/assets/icons/"+tag.icon} />
    }

    return <IonText 
              key={name}
              class="todoListItemTag"
              color={COLOR_SUCCESS} >
              <IonIcon  
                color='success' 
                src={"/assets/icons/tag.svg"} />
          {name}  
          </IonText>
  }

  const printTask = () => (
    <>
      <IonItem  button 
            color={((selectedTodo && selectedTodo.id === state.todo.id)? 'light' : '')}   
            lines="full">
        
            <IonAvatar onClick={() => {}} slot="start">
              {state.todo.done? (
                <AnimatedIcon  iconsvg={restart} actionFunc={doneHandler} />
              ) : (
                <AnimatedIcon  iconsvg={check} actionFunc={doneHandler} />
              )}
              
            </IonAvatar>
              <IonLabel onClick={handleSelectTodo}>
              <IonText color="primary">
                  <h2>{state.todo.name}</h2>
              </IonText>
              {state.todo.note? (
                <IonText color="secondary">
                  <p>{state.todo.note}</p>
                </IonText> 
              ) : (<></>)}
               
              </IonLabel>
              {state.todo.tags.sort().map(
                tag=>printSmallTagFromName(tag)
              )}
        </IonItem>
        {printEdit()}
    </>
  )


  const printEdit = () => {
    if(!selectedTodo || selectedTodo.id !== state.todo.id) return;
    return (
      <IonGrid>
        <IonRow>
            <IonCol class="todoTitleColumn" onClick={() => {}}  >
              <TodoEditInlineComponent 
                          todo={state.todo}
                          tagDocs={tagDocs}
                          dataFunctions={dataFunctions} />
                        
            </IonCol>
        </IonRow>
      </IonGrid>
    )
  }
  

  return printTask();
};

export default TodoListItemComp;
