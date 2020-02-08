import {
  IonPage,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar} from '@ionic/react';
import React, {  } from 'react';


const NotFound: React.FC = () => {

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>habits</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent >
        <div style={{padding:'20px'}}>
          This page does not exist
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NotFound;

