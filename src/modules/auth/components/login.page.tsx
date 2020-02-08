import React, {  } from 'react';

import {
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonPage
} from "@ionic/react";
import { logIn} from 'ionicons/icons';
import MyForm, { getValidator, FormItem, getFormOptions } from '../../forms/myForm';
import { authService } from '../authService';
import { useLocation, useHistory } from 'react-router';
import AuthMenuComponent from './auth.menu.component';
import './auth.css';

const LoginPage  = () => {

  console.log("LOGIN PAGE");
  const location = useLocation();
  const history = useHistory();
  console.log("LOCATION++++++++++++:::: ", location)

  const options = getFormOptions({
    submitButtongText: "Login"
  });
  
  const form: FormItem[] = [
    {
      id: 'id',
      displayName: 'ID (Username or Email): ',
      type: 'string',
      validators: [
        getValidator('isLength', {min:3, max:50}, 'ID needs to be between 3 to 50 characters')
  
      ],
    },
    {
      id: 'password',
      displayName: "Password: ",
      type: 'password',
      validators: [
        getValidator('isLength', {min:3, max:50}, 'ID needs to be between 3 to 50 characters')
      ]
    },
    
  ]
  
  const submit = async (form) => {
    console.log(form);
    authService.loginAndRedirect(
        form['id'].value, 
        form['password'].value,
        history,
        location);
  }

  
  const navigate = (url:string) => {
    history.push(url);
  }





  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{paddingTop:'50px'}} className="ion-text-center">
          <IonIcon icon={logIn} color="primary" className="iconFormCenter" />
        </div>
        <AuthMenuComponent page="login" />
        <div style={{padding:'20px'}}>
          <MyForm  items={form} options={options} submitFunction={submit} /> 
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
