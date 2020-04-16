import React, { useReducer, useEffect } from 'react';
import ulog from 'ulog'
import {  IonHeader, IonToolbar, IonTitle, IonContent,  IonButton, IonList, IonItem, IonLabel } from '@ionic/react';
import { Habit } from './models';
import { Line } from 'rc-progress';


const log = ulog('default');

const reducer = (state, {type, payload}) => {
  switch(type) {
    case 'setState': 
      return payload;
    case 'setDoc':
      return {...state, ...{doc: payload}}
    default:
      log.error('Incorrect action, ', type, payload);
      return state;
      
  }
}

const initState = {
  doc: {}
}


export const HabitPlantComponent = ({doc, closeFunc}: 
    {doc: Habit, closeFunc:Function}) => {

  const [state, _dispatch] = useReducer(reducer, initState); 

  const dispatch = (type:   'other'|
                            'setDoc'|
                            'setState', payload:any = {}) => {
  _dispatch({type, payload});
  }

  useEffect(() => {
    dispatch('setDoc', doc);
  }, [doc])


  return (
    <>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Plant Stats</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent>
     <IonList>
       <IonItem>
          <h2>Plant Name: {doc.plantName}</h2>
       </IonItem>
       <IonItem>
         <IonLabel>
           Plant Level: {doc.plantLevel}
          </IonLabel>
       </IonItem>
       <IonItem>
         <IonLabel>
           Plant Growth: {doc.plantExp}
          </IonLabel>
       </IonItem>
       <IonItem>
         <IonLabel>
          Next Level Growth Requirements: {doc.plantNextLevelExp}
          </IonLabel>
       </IonItem>
        <Line trailWidth={0}  percent={(doc.plantExp/doc.plantNextLevelExp*100)} 
                strokeWidth={2} strokeColor="#157F1F" />
     </IonList>
    </IonContent>
    <IonToolbar>
      {/*<IonButton
        onClick={()=> closeFunc(state.doc)}
      fill="clear">Save</IonButton> */}
      <IonButton
        onClick={()=> closeFunc()} 
        fill="clear">Close</IonButton>
    </IonToolbar>
  </>
  )
}
