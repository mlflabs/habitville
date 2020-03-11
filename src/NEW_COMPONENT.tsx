import React, { useReducer, useEffect } from 'react';
import ulog from 'ulog'
import {  IonHeader, IonToolbar, IonTitle, IonContent, 
  IonRefresher, IonRefresherContent, IonButton } from '@ionic/react';
import { dataService } from './modules/data/dataService';


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


const NewComp = ({doc, saveFunc, closeFunc}: 
    {doc:any, saveFunc:Function, closeFunc:Function}) => {

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
        <IonTitle>Add Note</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent>
      <IonRefresher slot="fixed" onIonRefresh={(e) => dataService.refresh(e)}>
        <IonRefresherContent></IonRefresherContent>
      </IonRefresher>

    </IonContent>
    <IonToolbar>
      <IonButton
        onClick={()=> saveFunc(state.doc)}
        fill="clear">Save</IonButton>
      <IonButton
        onClick={()=> closeFunc()} 
        fill="clear">Cancel</IonButton>
    </IonToolbar>
  </>
  )
}




export default NewComp;