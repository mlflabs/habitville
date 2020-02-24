import React, { useState, useEffect, useReducer } from 'react';
import { IonLabel, IonRow, IonCol, 
        IonIcon, IonGrid, IonButton, IonItemGroup, IonItemSliding, IonItem, IonItemOptions, IonItemOption, IonText, IonAvatar, IonThumbnail } from '@ionic/react';
import { Todo, TodoList, TodoTag } from './models';
import _ from 'lodash';
import { radioButtonOff, radioButtonOn, sunny, star, heart, basket, construct, arrowDownCircle, arrowForwardCircle, checkmark } from '../../../node_modules/ionicons/icons';
import { printCleanNote, getAction } from '../../utils';
import './todo.component.css'
import { DataFunctions } from './hooks/todos.hook';
import TodoEditInlineComponent from './todo.edit.inline.component';
import { gamifyService } from '../../modules/gamify/gamifyService';
import ulog from 'ulog'
import check from '../../icons/check.json';
import restart from '../../icons/restart.json'
import AnimatedIcon from '../../components/animatedIcon';

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
const TodoListItemComp = ({todo, tagDocs, selectedTodo, lastChild,  dataFunctions}:
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
  
  console.log('STATE TODONAME: ', state.todo.name);
  console.log(state);


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

  

  const printSmallTagFromFullname = (name:string) => {
    log.warn(tagDocs);
    const tag = tagDocs.find(t => t.fullname === name);
    console.log('Print small tag: ',tag, name)
    if(tag && tag.icon) {
      return <IonIcon  
                key={tag.fullname}
                size="small" 
                color='success' 
                src={"/assets/icons/"+tag.icon} />
    }

    return <IonIcon  
                key={name}
                size="small" 
                color='success' 
                src={"/assets/icons/tag.svg"} >
          {name}  
          </IonIcon>
    
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
                tag=>printSmallTagFromFullname(tag)
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
