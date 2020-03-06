import React, { useState, useEffect } from 'react';
import { Todo, TodoTag } from './models';
import { DataFunctions } from './hooks/todos.hook';
import _ from 'lodash';
import ulog from 'ulog';
import { IonLabel, IonTextarea, IonButton, IonIcon, IonAlert } from '@ionic/react';
import './todo.edit.component.css';
import { trash, close } from '../../../node_modules/ionicons/icons';


const log = ulog('todo');

const getDefaultState = (todo:Todo, tagDocs:TodoTag[]) =>  {
  return {
  todo: todo,
  tagDocs,
  showDeleteWarrning: false,
  text: mergeText(todo.name, todo.note)
}}

const mergeText = (name: string|undefined, note: string|undefined): string => {
  if(!name) name= '';
  if(!note) 
    note = '';
  else
    note = '\n'+note;
  return name + note;
}



const TodoEditInlineComponent = ({todo, tagDocs, dataFunctions}: 
        {todo:Todo,  tagDocs:TodoTag[], dataFunctions: DataFunctions}) => {
  log.warn("Edit Todo Render::: ", todo, tagDocs, tagDocs);

  const [state, setState] = useState(getDefaultState(todo, tagDocs));

  useEffect(() => {
    setState(getDefaultState(todo, tagDocs));
  }, [todo, tagDocs])

  const handleTitleChange = (e) => {
    const text = e.detail.value;
    var match = /\r|\n/.exec(text);
    if(match){
      const name = text.substring(0, match.index);
      const note = text.substring(match.index+1);
      const newDoc = {...state.todo, ...{name: name, note: note}}
      const newState = {...state, ...{todo: newDoc, text: text}};
      setState(newState);
    }
    else {
      const newDoc = {...state.todo, ...{name: text, note: ''}}
      const newState = {...state, ...{todo: newDoc, text: text}};
      setState(newState);
    }
  }

  const handleBlur = () => {
    dataFunctions.save(state.todo);
  }

  const showRemoveWarrning = () => {
    setState({...state, ...{showDeleteWarrning: true}});
  }


  const hideRemoveWarrning = () => {
    setState({...state, ...{showDeleteWarrning: false}});
  }

  const remove = () => {
    hideRemoveWarrning();
    if(state.todo.id)
      dataFunctions.remove(state.todo.id);
  }

  const printTag = (tag: TodoTag) => {
    let color;
    if(_.includes(state.todo.tags,tag.name)){
      color = 'success';
    }
    else {
      color = 'light';
    }
    return  <IonButton 
                fill="clear"
                size="default" 
                color={color} 
                key={tag.name + 'editicon'}  
                onClick={() => handleTagChange(tag)}>
              <IonIcon  src={"/assets/icons/"+tag.icon} /></IonButton>
  }


  const handleTagChange = (tag: TodoTag) => {
    log.error(tag, tagDocs);
    if(!state.todo.tags) state.todo.tags = [];
    const res = state.todo.tags.find(t=>t===tag.name);
    let newtags;
    if(res === undefined){
      newtags = _.concat(state.todo.tags, tag.name);
    }
    else {
      newtags = _.filter(state.todo.tags, t=>t!==tag.name);
    }
    dataFunctions.save(Object.assign(state.todo, {tags: newtags}));
  }


  return (

    <div className="">
        
        
        <div key="todoEditInlineIconScrollParent" className="todoEditInlineIconScrollParent">
          { tagDocs.map(tag => printTag(tag)) }
        </div>
        <IonTextarea 
            placeholder="Enter todo title and note here"
            name="note"
            class="todoEditInlineTextArea"
            autoGrow={true}
            onIonBlur={handleBlur}
            onIonChange={handleTitleChange}
            value={state.text}></IonTextarea>
        
        
        <div>
          <div className="todoButtonsLeftAlign">
              <IonButton size="small"  fill="clear" color="secondary" onClick={()=>{dataFunctions.select(null)}}>
                  <IonIcon  icon={close} /><IonLabel>Close</IonLabel>
              </IonButton>
          </div>
          <div className="todoButtonsRightAlign">
              <IonButton size="small"  fill="clear" color="danger" onClick={showRemoveWarrning}>
                  <IonIcon  icon={trash} /><IonLabel>Delete</IonLabel>
              </IonButton>
          </div>
        </div>
        <div className="todoInlineEditPadding"> </div>   

        <IonAlert
            isOpen={state.showDeleteWarrning}
            onDidDismiss={() => hideRemoveWarrning}
            header={'Warrning!!!'}
            message={'Are you sure you want to <strong>delete</strong> this task and its sub-tasks?'}
            buttons={[
              {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
                
              },
              {
                text: 'Yes Im Sure',
                handler: () => remove()
              }
            ]}
          />
    </div>

  );

}

export default TodoEditInlineComponent;