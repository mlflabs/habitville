import React, { useReducer, useEffect } from 'react';
import { IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonList, IonItem, IonAlert, IonFooter, IonButton, IonLabel } from '@ionic/react';
import  ulog from 'ulog';
import { Friend } from '../models';
import { socialService } from '../social.service';
import { useTranslation } from 'react-i18next';
import { HelpTooltip } from '../../../components/tooltip';
import LandscapeComp from './Landscape.component';
const log = ulog('social');

export interface FriendsState {
  showAddModal: boolean,
  friends: Friend[],
}


const reducer = (state, {type, payload}): FriendsState => {
  switch(type) {
    case 'showAddMemberModal':
      return {...state, ...{showAddModal: true}};
    case 'hideAddMemberModal':
      return {...state, ...{showAddModal: false}};
    case 'updateFriends':
      return {...state, friends: payload};
    default:
      log.error('Action type is not a match');
      return state;
  }
}

const FriendsListComponent = () => {
  const [state, _dispatch] = useReducer(reducer, {
    showAddModal: false,
    friends: [],
  })

  const { t } = useTranslation();

  useEffect(() => {
    const sub = socialService.state$.subscribe(s => {
      dispatch('updateFriends', s.friends)
    });
    return () => {
      sub.unsubscribe();
    }
  }, [])

  const dispatch = (type: 'showAddMemberModal'|
                          'hideAddMemberModal'|
                          'updateFriends', 
                    payload:any = {}) => {
    _dispatch({type, payload});
  }

  const addFriend = () => {
    dispatch("showAddMemberModal");
    
  }

  const hideAddUser = () => {
    dispatch('hideAddMemberModal');
  }

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>{t('social.friends')}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList>
            {state.friends.map(friend => (
              <IonItem  
                        lines="none"
                        key={friend.id}
                        onClick={() => {}}>
             <LandscapeComp username={friend.username} 
                            landscape={friend.landscape} />
            </IonItem>
            ))}
        </IonList>
        
      </IonCardContent>
        <IonFooter>
          <IonButton onClick={()=>addFriend()} fill="clear">{t('social.friendAdd')}</IonButton>
          <HelpTooltip message={t('tooltips.addFriends')} />

          <IonButton onClick={()=>socialService.updateSocialUsers()} fill="clear">Update</IonButton>
          
        </IonFooter>
      <IonAlert 
        isOpen={state.showAddModal}
        onDidDismiss={() => hideAddUser()}
        header= {t('social.friendUsername')}
        inputs={[
          {
            name: 'username',
            type: 'text',
            id: 'username',


          }
        ]}
        buttons={[
          {
            text: t('Cancel'),
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              hideAddUser();
            }
          },
          {
            text: t('social.inviteFriend'),
            handler: (data) => {
              socialService.addFriend(data.username);
              hideAddUser();
            }
          }
        ]}
      />
    </IonCard>
  )

}
export default FriendsListComponent;