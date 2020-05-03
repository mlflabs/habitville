import React, { useReducer, useEffect } from 'react';
import { IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonList, IonItem, IonAlert, IonFooter, IonButton, IonLabel, IonFab, IonFabButton, IonIcon } from '@ionic/react';
import  ulog from 'ulog';
import { Friend } from '../models';
import { socialService } from '../social.service';
import { useTranslation } from 'react-i18next';
import { HelpTooltip } from '../../../components/tooltip';
import LandscapeComp from './Landscape.component';
import { COLOR_LIGHT } from '../../../colors';
import { refresh } from 'ionicons/icons';
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
                            level={friend.level}
                            landscape={friend.landscape} />
            </IonItem>
            ))}
        </IonList>
        
      </IonCardContent>
        <IonFooter>
          <IonButton onClick={()=>addFriend()} fill="clear">{t('social.friendAdd')}</IonButton>
          <HelpTooltip message={t('tooltips.addFriends')} />
          <IonFab horizontal="end" vertical="top" >
            <IonFabButton  
                onClick={()=>socialService.updateSocialUsers()}
                color={COLOR_LIGHT}>
              <IonIcon 
                icon={refresh} />
            </IonFabButton>
          </IonFab>
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
            placeholder: t('auth.username')
          },
          {
            name: 'note',
            type: 'textarea',
            id: 'note',
            placeholder: t('note')
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
              socialService.addFriend(data.username, data.note);
              hideAddUser();
            }
          }
        ]}
      />
    </IonCard>
  )

}
export default FriendsListComponent;