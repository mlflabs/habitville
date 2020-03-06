import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonMenu,
  IonMenuToggle,
  IonGrid,
  IonCol,
  IonRow
} from '@ionic/react';
import React from 'react';
import { withRouter, useLocation } from 'react-router-dom';
import MenuHeaderWithProgress from './MenuHeaderWithProgress';
import { useMenuHookFacade } from '../modules/menu/hooks/menu.hook';
import './menu.css';
import ulog from 'ulog'

const log = ulog('menu')

const Menu = () => {

  const [state,] = useMenuHookFacade();
  const location = useLocation();
  const path = location.pathname;
  log.warn(path);
  return (
    <IonMenu key="ionmenu_left" contentId="main" type="overlay">
      <MenuHeaderWithProgress key="menu_header" />
      <IonContent key="menu_left" >
        <IonGrid>
        {state.appPages.map((appPage, index) => {
          return (
            <>
              <IonRow key={appPage.title.replace(' ', '')+appPage.url + index}>
                <IonCol class="leftMenuCol">
                <IonMenuToggle  autoHide={false}>
                  <IonItem
                        color={(path === appPage.url? 'light' : '')}   
                        routerLink={appPage.url} routerDirection="none">
                    <IonIcon slot="start" icon={appPage.icon} />
                    <IonLabel>{appPage.title}</IonLabel>
                  </IonItem>
                </IonMenuToggle>
                </IonCol>
              </IonRow>
              {appPage.lastComponent? (
                appPage.lastComponent
              ) : (<></>)}
            </>
        )})}
        </IonGrid>
      </IonContent>
    </IonMenu>
)};

export default withRouter(Menu);
