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

const RegisterPage  = () => {
  const location = useLocation();
  const history = useHistory();
  const options = getFormOptions({
    submitButtongText: "Login"
  });
  
  const form: FormItem[] = [
    {
      id: 'username',
      displayName: 'Username: ',
      type: 'string',
      validators: [
        getValidator('isLength', {min:3, max:20}, 'Username needs to be between 3 to 20 characters')
  
      ],
    },
    {
      id: 'email',
      displayName: 'Email: ',
      type: 'string',
      validators: [
        getValidator('isEmail',{}, 'Email is not valid')
  
      ],
    },
    {
      id: 'password',
      displayName: "Password: ",
      type: 'password',
      validators: [
        getValidator('isLength', {min:3, max:50}, 'Password needs to be between 3 to 50 characters')
      ]
    },
    
  ]
  
  const submit = async (form) => {
    const res = await authService.register(
                        form['username'].value, 
                        form['email'].value,
                        form['password'].value);
    if(res){
      authService.loginAndRedirect(
                        form['username'].value, 
                        form['password'].value,
                        history,
                        location)
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Register</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{paddingTop:'50px'}} className="ion-text-center">
          <IonIcon  color="primary"
                    icon={logIn} 
                    className="iconFormCenter" />
        </div>
        <AuthMenuComponent page="register" />
        <div style={{padding:'20px'}}>
          <MyForm  items={form} options={options} submitFunction={submit} /> 
        </div>

        
      </IonContent>
    </IonPage>
  );
};

export default RegisterPage;
