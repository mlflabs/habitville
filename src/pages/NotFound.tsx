import {
  IonPage,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar} from '@ionic/react';
import React, {  } from 'react';
import HeaderWithProgress from '../components/HeaderWithProgress';


const NotFound: React.FC = () => {

  return (
    <IonPage>
      <HeaderWithProgress title="I think it was left or was it right?" />
      <IonContent >
        <div style={{padding:'20px'}}>
          This page does not exist
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NotFound;

