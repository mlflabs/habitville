import React, { useEffect, useState } from 'react'
import { FormValueItem } from './myForm';
import {  IonBackButton, IonButtons, IonContent, 
  IonInput, IonLabel, IonItem,
  IonHeader, IonPage, IonTitle, IonToolbar, IonNote, IonText } from '@ionic/react';


const MyInput = ({data, updateFunction}) => {



  //const [_data, setData] = useState<FormValueItem>(data); 

  /*
  useEffect(() => {
    props.attachToForm({name:props.name, value: props.value});

    return props.detachFromForm({name:props.name, value:props.value});
  },[props]);
  */

  const handleChange = (event) => {
    updateFunction(data.id, data.name, event.target.value, 
        data.messages, data.hasValidation, data.dirty);
    // setValue(event.target.value);
    // data.id = test;
  };

  const handleBlur = (event) => {
    if(data.dirty === true) return;
    updateFunction(data.id, data.name, event.target.value, 
      data.messages, data.hasValidation, true);
    
  }

  const printErrors = () => {
    if(data.dirty){
      const errors =data.errors.map(m => (
        <IonNote key={m} color="danger">{m}</IonNote>
      ))
      return errors;
    }
  }


  return (
    <IonItem>
      <IonLabel position="floating">
        {data.name}
        { data.hasValidation?(
          <IonText color="danger">*</IonText>
        ):null}
      </IonLabel>
      <IonInput 
        name={data.id}
        value={data.value}
        // color={"warning"}
        required={true}
        onIonBlur={handleBlur}
        onIonChange={handleChange}></IonInput>
        {data.messages.map(m => (
          <IonNote key={m}>{m}</IonNote>
        ))}
        {printErrors()}
    </IonItem>
  )
}

export default MyInput;