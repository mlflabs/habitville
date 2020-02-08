import React from 'react';
import { IonHeader, IonToolbar, IonPage, IonTitle, IonContent, IonLabel } from '@ionic/react';



const UserPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>User Page</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLabel>User</IonLabel>
      </IonContent>
    </IonPage>
  );
};

export default UserPage;
