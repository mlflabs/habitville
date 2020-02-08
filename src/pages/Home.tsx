import {
  IonPage,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar} from '@ionic/react';
import React, {  } from 'react';
import './Home.css';
import HeaderWithProgress from '../components/HeaderWithProgress';

const Home: React.FC = () => {




  return (
    <IonPage>
      <HeaderWithProgress title="HabitVille" />
      <IonContent >
        Future home of HabitVille
      </IonContent>
    </IonPage>
  );
};

export default Home;

