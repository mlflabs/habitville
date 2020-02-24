import React, { useState } from 'react';
import { Todo, TYPE_TODO, TodoList, getDefaultTodoList, TodoTag } from './models';
import {IonInput} from '@ionic/react';
import { generateCollectionId } from '../../modules/data/utilsData';
import ulog from 'ulog'


const log = ulog('todo');


const TodoNewComp = ({list, tag,  saveFunc, projectId}:
  {list:TodoList|undefined, tag:TodoTag|undefined, projectId: string, saveFunc: Function}) => {

  const [state, setState] = useState({title:''});
  
  //TODOS: testing....
  const setNewTitle = (e) => {
    setState({title: e.detail.value});
  }

  const onKeyPress = (e) => {
    if(e.key === 'Enter'){
      save();
      setState({title: ''});
    }
  }


  const save = async () => {
      let fullname;
      if(!list){
        fullname = getDefaultTodoList('tasks', projectId).fullname;
      }
      else {
        fullname = list.fullname;
      }
      

      log.warn('SAVING TODO::: ', projectId, list);
      const id = generateCollectionId(projectId, TYPE_TODO)
      const newDoc = new Todo({
        id, 
        name: state.title, 
        list: fullname,
        _new: true});

      if(tag){
        log.warn('Saving a tag made manually ', tag);
        newDoc.tags.push(tag.fullname);
      }
       
      log.warn('NEW TODO::::::::::::::: ', newDoc)
      await saveFunc(newDoc);
  };


  return (
    <IonInput
            className="new-todo"
            placeholder="What needs to be done?"
            onKeyPress={onKeyPress}
            onIonChange={setNewTitle}
            value={state.title}
    />
  )


}

export default TodoNewComp;