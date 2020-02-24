import React, { useState } from 'react';
import { IonInput } from '@ionic/react';
import { ProjectItem } from '../../modules/data/models';
import { generateCollectionId, getProjectChildId } from '../../modules/data/utilsData';
import { TYPE_TODO_LIST, TodoList } from './models';
import ulog from 'ulog';
import { todoService } from './todo.service';

const log = ulog('todo');


const ListAddInlineComponent = ({projectid}:{projectid: string}) => {

  const [state, setState] = useState({name:''});

  const setNewTitle = (e) => {
    setState({name: e.detail.value});
  }
  
  const onKeyPress = (e) => {
    if(e.key === 'Enter'){
      save();
      setState({name: ''});
    }
  }

  const save = async () => {
    const id = generateCollectionId(projectid, TYPE_TODO_LIST, encodeURI(state.name));
    const newList = new TodoList({
      id,
      name: state.name,
      secondaryType: TYPE_TODO_LIST,
      //folder??
      project: getProjectChildId(projectid),
    })
    newList._new = true;

    log.info('NEW TODO LIST::::::::::::::: ', newList)
    const res = await todoService.saveList(newList);
    log.info(res);
  };

  return (
    <IonInput
      className="new-todo"
      placeholder="Add new List?"
      onKeyPress={onKeyPress}
      onIonChange={setNewTitle}
      value={state.name}
    />
  )
}

export default ListAddInlineComponent;