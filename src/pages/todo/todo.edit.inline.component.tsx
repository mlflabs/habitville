import React, { useState, useEffect } from 'react';
import { Todo } from './models';
import { DataFunctions } from './hooks/todos.hook';
import _ from 'lodash';
import { IonLabel, IonTextarea, IonButton, IonIcon, IonAlert } from '@ionic/react';
import './todo.edit.component.css';
import { sunny, star, heart, trash, basket, construct, close, checkmark } from '../../../node_modules/ionicons/icons';

const getDefaultState = (todo:Todo) =>  {
  return {
  todo: todo,
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



const TodoEditInlineComponent = ({todo, tags, dataFunctions}: 
        {todo:Todo,  tags:string[], dataFunctions: DataFunctions}) => {
  console.log("Edit Todo Render::: ", todo);

  const [state, setState] = useState(getDefaultState(todo));

  useEffect(() => {
    setState(getDefaultState(todo));
  }, [todo])

  const handleTitleChange = (e) => {
    const text = e.detail.value;
    console.log(text);
    var match = /\r|\n/.exec(text);
    console.log('Title Chagne: ', text, match)
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
    console.log("Saving todo::: ", state);
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
    console.log('REMVE ACTION STATE::::::: ', state);
    if(state.todo.id)
      dataFunctions.remove(state.todo.id);
  }

  const printTag = (tag: string) => {
    const color = (_.includes(state.todo.tags,tag))? 'success': 'light';
    if(tag === 'today')
      return (<IonButton class="todoEditInlineIconScrollChild" size="small" key={tag} fill="clear" color={color} onClick={() => handleTagChange(tag)}>
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


  return (

    <div className="">
        
        
        <div className="todoEditInlineIconScrollParent">
          { tags.map(tag => printTag(tag)) }
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