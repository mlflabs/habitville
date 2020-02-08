import React from 'react';
import { IonHeader, IonToolbar, IonPage, IonTitle, IonContent, IonLabel } from '@ionic/react';



const IntroPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Loading</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLabel>Loading.....</IonLabel>
      </IonContent>
    </IonPage>
  );
};

export default IntroPage;
