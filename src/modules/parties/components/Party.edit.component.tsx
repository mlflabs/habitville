import React, { useState } from 'react';
import { PartyProject } from '../models';
import { IonHeader, IonToolbar, IonPage, IonTitle, IonContent, IonItem, IonInput, IonLabel, IonTextarea, IonFooter, IonButton } from '@ionic/react';





const PartyEditComponent = ({party, dismissFunc}:
    {party: PartyProject, dismissFunc:{(party: PartyProject|null, action: 'save'| 'remove' | 'none')}}) => {

  const [state, setState] = useState({party})


  const handleChange = (e) => {
    const newDoc = {...state.party, ...{[e.target.name]:e.detail.value}}
    const newState = {...state, ...{party: newDoc}};
    setState(newState);
  }


  return (
    <>
      <IonHeader>
            <IonToolbar>
              <IonTitle>Add/Edit Party</IonTitle>
            </IonToolbar>
      </IonHeader>
      <IonContent>
          <IonItem>
                <IonLabel position="floating">Name</IonLabel>
                <IonInput 
                    name="name"
                    placeholder="Your Cool Party Name" 
                    onIonChange={handleChange}
                    value={state.party.name} />
            </IonItem>
            <IonItem>
                <IonLabel position="floating">Note</IonLabel>
                <IonTextarea 
                    placeholder="More details for your party members"
                    name="note"
                    onIonChange={handleChange}
                    value={state.party.note}></IonTextarea>
            </IonItem>
            <IonFooter>
              <IonToolbar>
                <IonTitle>
                  <IonButton onClick={() => dismissFunc(state.party, 'save')}>Save</IonButton>
                  <IonButton onClick={() => dismissFunc(null, 'none')}>Cancel</IonButton>
                </IonTitle>
              </IonToolbar>
            </IonFooter>
      </IonContent>
    </>
  );
}

export default PartyEditComponent;