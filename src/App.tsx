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
import {I18nextProvider} from 'react-i18next';
import i18next from 'i18next';

//transllations
import common_en from "./translations/en/common.json";



i18next.init({
  interpolation: { escapeValue: false },  // React already does escaping
  lng: 'en',                              // language to use
  resources: {
      en: {
          common: common_en               // 'common' is our custom namespace
      },
  },
});


const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <I18nextProvider i18n={i18next}>
        <Loading /><Toasts />
        <Routes />
      </I18nextProvider>,
    </IonReactRouter>
  </IonApp>
);

export default App;
