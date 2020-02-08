import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonMenu,
  IonMenuToggle,
  IonGrid,
  IonCol,
  IonRow,
  IonButton
} from '@ionic/react';
import React from 'react';
import { withRouter, useLocation } from 'react-router-dom';
import MenuHeaderWithProgress from './MenuHeaderWithProgress';
import { useMenuHookFacade } from '../modules/menu/hooks/menu.hook';
import './menu.css';


const Menu = () => {

  const [state,] = useMenuHookFacade();
  const location = useLocation();

  const path = location.pathname;

  return (
    <IonMenu key="ionmenu_left" contentId="main" type="overlay">
      <MenuHeaderWithProgress />
      <IonContent key="menu_left" >
        <IonGrid>
        {state.appPages.map((appPage, index) => {
          return (
            <>
              <IonRow key={appPage.title.replace(' ', '')+appPage.url}>
                <IonCol class="leftMenuCol">
                <IonMenuToggle  autoHide={false}>
                  <IonItem
                        color={(path.startsWith(appPage.url)? 'light' : '')}   
                        routerLink={appPage.url} routerDirection="none">
                    <IonIcon slot="start" icon={appPage.icon} />
                    <IonLabel>{appPage.title}</IonLabel>
                  </IonItem>
                </IonMenuToggle>
                </IonCol>
              </IonRow>
              {(appPage.subPages.length > 0)? (
                <>
                  {appPage.subPages.map((subPage, index2) => {
                    return (
                      <IonRow key={appPage.title.replace(' ', '')+appPage.url+ '_' + subPage.url}>
                        <IonCol class="leftSubMenuCol">
                        <IonMenuToggle autoHide={false}>
                          <IonButton  fill="clear"  
                                      color={(path.startsWith(subPage.url)? 'success' : '')}   
                                      class="menuButton"
                                      routerLink={subPage.url} 
                                      routerDirection="none">
                            <IonIcon slot="start" icon={subPage.icon} />
                            <IonLabel>{subPage.title}</IonLabel>
                          </IonButton>
                        </IonMenuToggle>
                        </IonCol>
                      </IonRow>
                    )
                  })}
                </>
              ) : (
                <div key={appPage.title + "_empty"} />
              )}
            </>
        )})}
        </IonGrid>
      </IonContent>
    </IonMenu>
)};

export default withRouter(Menu);
