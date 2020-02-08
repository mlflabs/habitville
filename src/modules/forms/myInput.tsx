import React from 'react'
import {  IonInput, IonLabel, IonItem,
  IonNote, IonText } from '@ionic/react';


const MyInput = ({data, updateFunction}) => {



  //const [_data, setData] = useState<FormValueItem>(data); 

  /*
  useEffect(() => {
    props.attachToForm({name:props.name, value: props.value});

    return props.detachFromForm({name:props.name, value:props.value});
  },[props]);
  */

  //console.log("MY Input DATA: ", data);

  const handleChange = (event) => {
    updateFunction({...data, ...{value: event.target.value, dirty: true}});
  };

  const handleBlur = (event) => {
    if(data.dirty === true) return;
    updateFunction({...data, ...{value: event.target.value, dirty: true}});
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
      <IonLabel position="stacked">
        {data.displayName}
        { data.hasValidation?(
          <IonText color="danger">*</IonText>
        ):null}
      </IonLabel>
      <IonInput 
        name={data.id}
        value={data.value}
        type={data.type}
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