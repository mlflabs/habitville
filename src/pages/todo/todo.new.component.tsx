import React, { useState } from 'react';
import { Todo, TYPE_TODO } from './models';
import {IonInput} from '@ionic/react';
import { generateCollectionId } from '../../modules/data/utilsData';

const TodoNewComp = ({parentId = undefined, saveFunc, projectId}:
  {parentId: string|undefined, projectId: string, saveFunc: Function}) => {

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
      const id = generateCollectionId(projectId, TYPE_TODO)
      const newDoc = new Todo({_id: id, title: state.title, parent: parentId, _new: true});
      console.log('NEW TODO::::::::::::::: ', newDoc)
      await saveFunc(newDoc, parentId);
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