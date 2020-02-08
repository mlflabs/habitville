import React, {  } from 'react';
import { Redirect, Route, useHistory, useLocation } from 'react-router-dom';
import UserPage from './modules/auth/components/user.page';
import TodosPage from './pages/todo/Todos.page';
import IntroPage from './modules/auth/components/intro.page';
import { useAppStatus, AppStatus } from './modules/app/hooks/appStatus.hook';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import UnauthenticatedRoute from './modules/auth/unauthenticatedRoute';
import HabitsPage from './pages/habits/Habits.page';
import { home, timer, apps } from '../node_modules/ionicons/icons';
import { IonSplitPane, IonRouterOutlet } from '../node_modules/@ionic/react';
import Menu from './components/Menu';
import PartiesPage from './modules/parties/pages/Parties.page';
import PartyViewPage from './modules/parties/pages/Party.view.page';

export const Routes = () => {
  const [appStatus] = useAppStatus();
  const history = useHistory();
  const location = useLocation();

  console.log('APP RERENDER::::::::::::::::::::::::::::::::::::::', appStatus, location, history);
  

  
  if(appStatus === AppStatus.auth && location.pathname.startsWith('/auth/')){
    if(location.state){
      const newpath = location.state['prev'] || '/';
      history.push(newpath);
    }
    
  }

  const getRoutes = () => {
    switch(appStatus){
      case AppStatus.auth:
        return (
          <IonSplitPane when="sm" contentId="main">
            <Menu key="menu" />
            <IonRouterOutlet id="main">
                <Route path="/home" component={Home} exact={true} />           
                <Route exact path="/auth/user" component={UserPage} />
                <Route path="/todos" component={TodosPage} exact={true} />
                <Route path="/todos/:tag" component={TodosPage} exact={true} />
                <Route path="/habits" component={HabitsPage} exact={true} />
                <Route path="/parties" component={PartiesPage} exact={true} />
                <Route path="/parties/:id" component={PartyViewPage} exact={true} />
                <Route path="/" render={() => <Redirect to="/home" />} exact={true} />
                <Route path="/404" component={NotFound} />
                <Redirect to="/404" />
            </IonRouterOutlet>
        </IonSplitPane>
        )
      case AppStatus.guest:
          return (
            <IonRouterOutlet>
              <UnauthenticatedRoute exact path="*" component={Home} />
            </IonRouterOutlet>
          );
      default:
          return (
            <IonRouterOutlet>
              <Route exact path="*"  component={IntroPage} />
            </IonRouterOutlet>
          );
      

    }
  }

  return getRoutes();
}