import React, { useState, useEffect } from 'react';
import { IonButton } from '@ionic/react';
import './auth.css';
import { useLocation, useHistory } from 'react-router-dom';





const AuthMenuComponent = ({page}: {page:string}) => {
  const location = useLocation();
  const history = useHistory();
  
  const push = (url:string) => {
    console.log(location.pathname);
    if(location.pathname && url !== location.pathname){
      history.push(url);
    }

  }
  
  
  return (
    <div className="authMenuParent" >
      <IonButton  onClick={() => push('/auth/login')}
                  size="small"  
                  color={(page==='login')? 'success':'light'}
                  fill="clear">
          Login
      </IonButton>
      <IonButton   onClick={() => push('/auth/register')}
                  size="small"  
                  color={(page==='register')? 'success':'light'}
                  fill="clear">
          Register
      </IonButton>

    </div>
  );
}

export default AuthMenuComponent;