import React, { useReducer, useEffect } from 'react';
import ulog from 'ulog'
import { IonItem, IonHeader, IonToolbar, IonTitle,  IonContent, IonButton, IonTextarea } from '@ionic/react';
import { Challenge, ChallengeAction } from '../models';


const log = ulog('challenge');

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


const ChallengeAddActionNoteComponent = ({doc, submitFunc, closeFunc}: 
    {doc:ChallengeAction, submitFunc:Function, closeFunc:Function}) => {

  const [state, _dispatch] = useReducer(reducer, {doc,}); 
  const dispatch = (type:   'other'|
                            'setDoc'|
                            'setState', payload:any = {}) => {
  _dispatch({type, payload});
  }

  useEffect(() => {
    dispatch('setDoc', doc);
  }, [doc])

  const handleChange = (e) => {
    const newDoc = Object.assign(state.doc);
    newDoc.data.note =  e.detail.value
    dispatch('setDoc', newDoc);
  }

  /*
  const handleNamedChange = (property, value) => {
    const newDoc = {...state.doc, ...{[property]: value}}
    dispatch('setDoc', newDoc)
  }
  */

  return (
  <>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Add Note</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent>
      <IonItem>
        <IonTextarea 
          name="note"
          autofocus={true}
          autoGrow={false}
          spellCheck={true}
          onIonChange={handleChange}
          value={state.doc.data.note}
          rows={10}
          placeholder="Enter message here..."></IonTextarea>
      </IonItem>

    </IonContent>
    <IonToolbar>
      <IonButton
        onClick={()=> submitFunc({...state.doc, ...{value: 1}})}
        fill="clear">Submit</IonButton>
      <IonButton
        onClick={()=> closeFunc()} 
        fill="clear">Cancel</IonButton>
    </IonToolbar>
  </>
  )
}




export default ChallengeAddActionNoteComponent;