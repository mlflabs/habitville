import React, { useState } from 'react';
import { PartyProject } from '../models';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, 
  IonInput, IonLabel, IonTextarea, IonFooter, IonButton } from '@ionic/react';
import { useTranslation } from 'react-i18next';




const PartyEditComponent = ({party, dismissFunc}:
    {party: PartyProject| null, dismissFunc:{(party: PartyProject|null, action: 'save'| 'remove' | 'none')}}) => {

  const {t} = useTranslation();
  const [state, setState] = useState({party: party||new PartyProject()})


  const handleChange = (e) => {
    const newDoc = {...state.party, ...{[e.target.name]:e.detail.value}}
    const newState = {...state, ...{party: newDoc}};
    setState(newState);
  }


  return (
    <>
      <IonHeader>
            <IonToolbar>
              <IonTitle>{t("clash.editTitle")}</IonTitle>
            </IonToolbar>
      </IonHeader>
      <IonContent>
          <IonItem>
                <IonLabel position="floating">{t('name')}</IonLabel>
                <IonInput 
                    name="name"
                    placeholder={t('clash.namePlaceholder')} 
                    onIonChange={handleChange}
                    value={state.party.name} />
            </IonItem>
            <IonItem>
                <IonLabel position="floating">{t('note')}</IonLabel>
                <IonTextarea 
                    placeholder={t('clash.notePlaceholder')}
                    name="note"
                    onIonChange={handleChange}
                    value={state.party.note}></IonTextarea>
            </IonItem>
            <IonFooter>
              <IonToolbar>
                <IonTitle>
                  <IonButton onClick={() => dismissFunc(state.party, 'save')}>{t('save')}</IonButton>
                  <IonButton onClick={() => dismissFunc(null, 'none')}>{t('cancel')}</IonButton>
                </IonTitle>
              </IonToolbar>
            </IonFooter>
      </IonContent>
    </>
  );
}

export default PartyEditComponent;