import React, { useState, useEffect } from 'react';
import { Todo } from './models';
import { DataFunctions } from './hooks/todos.hook';
import _ from 'lodash';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonLabel, IonInput, IonTextarea, IonButton, IonIcon, IonFabButton, IonAlert, IonGrid, IonRouterLink, IonRow, IonCol } from '@ionic/react';
import './todo.edit.component.css';
import { sunny, star, heart, train, trash, basket, construct } from '../../../node_modules/ionicons/icons';

const getDefaultState = (todo:Todo) =>  {
  return {
  todo: todo,
  showDeleteWarrning: false
}}

const TodoEditComponent = ({todo, tags, dataFunctions}: 
        {todo:Todo,  tags:string[], dataFunctions: DataFunctions}) => {
  const backgroundColor = "medium";
  console.log("Edit Todo Render::: ", todo);

  const [state, setState] = useState(getDefaultState(todo));

  useEffect(() => {
    setState(getDefaultState(todo));
  }, [todo])


  const handleChange = (e) => {
    const newDoc = {...state.todo, ...{[e.target.name]:e.detail.value}}
    const newState = {...state, ...{todo: newDoc}};
    setState(newState);
  }

  const handleBlur = (e) => {
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
    if(state.todo._id)
      dataFunctions.remove(state.todo._id);
  }

  const printTag = (tag: string) => {
    const color = (_.includes(state.todo.tags,tag))? 'success': 'light';
    if(tag === 'today')
      return (<IonButton size="small" key={tag} fill="clear" color={color} onClick={() => handleTagChange(tag)}>
                  <IonIcon  icon={sunny} /><IonLabel>{tag}</IonLabel>
              </IonButton>);
    if(tag === 'important')
      return (<IonButton size="small" key={tag} fill="clear" color={color} onClick={() => handleTagChange(tag)}>
                  <IonIcon  icon={star} /><IonLabel>{tag}</IonLabel>
              </IonButton>); 
    if(tag === 'wish')
      return (<IonButton size="small" key={tag} fill="clear" color={color} onClick={() => handleTagChange(tag)}>
                <IonIcon  icon={heart} /><IonLabel>{tag}</IonLabel>
            </IonButton>); 
    if(tag === 'buy')
      return (<IonButton size="small" key={tag} fill="clear" color={color} onClick={() => handleTagChange(tag)}>
              <IonIcon  icon={basket} /><IonLabel>{tag}</IonLabel>
          </IonButton>);
    if(tag === 'projects')
      return (<IonButton size="small" key={tag} fill="clear" color={color} onClick={() => handleTagChange(tag)}>
              <IonIcon  icon={construct} /><IonLabel>{tag}</IonLabel>
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
        <IonCard class="todoEditCard"  color={backgroundColor} style={{height: '-webkit-fill-available'}}>
         
          <IonGrid class="ion-align-items-center">
            <IonRow>
              <IonCol >
                <IonCardTitle>Edit</IonCardTitle> 
              </IonCol>
              <IonCol  size="auto"  class="ion-align-items-end">
                <IonButton 
                        fill="clear"
                        class="editButton"
                        onClick={() => dataFunctions.select(null)}
                        color="primary" > Done </IonButton>

              </IonCol>
            </IonRow>
          </IonGrid>
  
          <IonCardContent>
            <IonItem color={backgroundColor}  class="todoCardComponets">
              <IonLabel position="floating">Title</IonLabel>
              <IonInput 
                  name="title"
                  placeholder="What needs to be done?" 
                  onIonChange={handleChange}
                  onIonBlur={handleBlur}
                  value={state.todo.title} />
            </IonItem>
            <IonItem color={backgroundColor}>
              <IonLabel position="floating">Note</IonLabel>
              <IonTextarea 
                  placeholder="Enter more information here, motivate yourself..."
                  name="note"
                  autoGrow={true}
                  onIonBlur={handleBlur}
                  onIonChange={handleChange}
                  value={state.todo.note}></IonTextarea>
            </IonItem>
            <div color={backgroundColor}>
             { tags.map(tag => printTag(tag)) }
            </div>
            <IonItem color={backgroundColor}>
             <IonFabButton size="small" slot="end" onClick={showRemoveWarrning}>
                <IonIcon icon={trash} />
             </IonFabButton>
            </IonItem>
          </IonCardContent>

          


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
        </IonCard>


  );

}

export default TodoEditComponent;