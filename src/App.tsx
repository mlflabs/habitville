import React from 'react';
import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';


/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

import './theme/my.css';

import { Loading } from './modules/loading/loading.component';
import { Routes } from './routes';
import { Toasts } from './modules/toast/toast.component'; 
import AppModals from './modules/app/AppModals';





const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
        <Loading /><Toasts /><AppModals />
        <Routes />
    </IonReactRouter>
  </IonApp>
);

export default App;
