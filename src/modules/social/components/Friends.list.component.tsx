import React, { useReducer } from 'react';
import { IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonList, IonItem, IonAlert, IonFooter, IonButton, IonLabel } from '@ionic/react';
import  ulog from 'ulog';
import { Friend } from '../models';
import { socialService } from '../social.service';
const log = ulog('social');

export interface FriendsState {
  showAddModal: boolean,
  friends: Friend[],
}


const reducer = (state, action): FriendsState => {
  switch(action.type) {
    case 'showAddMemberModal':
      return {...state, ...{showAddModal: true}};
    case 'hideAddMemberModal':
      return {...state, ...{showAddModal: false}};

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

  const dispatch = (type: 'showAddMemberModal'|
                          'hideAddMemberModal', 
                    data:any = {}) => {
    _dispatch({type, data});
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
        <IonCardTitle>Friends</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList>
            {state.friends.map(member => (
              <IonItem  button 
                        key={member.id}
                        onClick={() => {}}>
              <IonLabel>
                {member.username}
              </IonLabel>
            </IonItem>
            ))}
        </IonList>
        
      </IonCardContent>
        <IonFooter>
          <IonButton onClick={()=>addFriend()} fill="clear">Add Friend</IonButton>
        </IonFooter>
      <IonAlert 
        isOpen={state.showAddModal}
        onDidDismiss={() => hideAddUser()}
        header="Friend's Username:"
        inputs={[
          {
            name: 'username',
            type: 'text',
            id: 'username',


          }
        ]}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              hideAddUser();
            }
          },
          {
            text: 'Invite User',
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