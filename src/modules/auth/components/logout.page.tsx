import React from 'react';
import { IonHeader, IonToolbar, IonPage, IonTitle, IonContent, IonLabel } from '@ionic/react';



const LogoutPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Logout Page</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLabel>Logout</IonLabel>
      </IonContent>
    </IonPage>
  );
};

export default LogoutPage;
