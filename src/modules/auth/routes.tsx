import React from 'react';
import { Redirect, Route } from 'react-router';
import LoginPage from './components/login.page';
import LogoutPage from './components/logout.page';
import UserPage from './components/user.page';
import RegisterPage from './components/register.page';
import { IonRouterOutlet } from '@ionic/react';


const authNotLoggedInRoutes = () => (
  <Route exact path="/auth" component={UserPage}>
      <Route exact path="/auth/login" component={LoginPage}/>
      <Route exact path="/auth/logout" component={LogoutPage}/>
      <Route exact path="/auth/register" component={RegisterPage}/>
  </Route>
)


export default authNotLoggedInRoutes;