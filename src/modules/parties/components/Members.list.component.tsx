import React, { useState } from 'react';
import { PartyProject } from '../models';
import { IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonList, IonItem, IonFab, IonFabButton, IonIcon, IonAlert, IonFooter, IonButton } from '@ionic/react';
import { add } from 'ionicons/icons';
import { alertController } from '../../../../node_modules/@ionic/core';
import { partyService } from '../party.service';


export interface MembersState {
  showAddModal: boolean,
}


const PartyMembersListComponent = ({project}:{project:PartyProject}) => {
  const [state, setState] = useState<MembersState>({showAddModal: false})


  const addMember = () => {
    setState({...state, ...{showAddModal: true}});
  }

  const hideAddUser = () => {
    setState({...state, ...{showAddModal: false}});
  }

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Members</IonCardTitle>
        {state.showAddModal? (
          <IonItem>
            
          </IonItem>
        ) : (
          <></>
        )}
      </IonCardHeader>
      <IonCardContent>
        <IonList>
         
        </IonList>
        
      </IonCardContent>
      <IonFooter>
        <IonButton onClick={()=>addMember()} fill="clear">Add Member</IonButton>
      </IonFooter>
      <IonAlert 
        isOpen={state.showAddModal}
        onDidDismiss={() => hideAddUser()}
        header="Friend ID:"
        subHeader={'Found at bottom of parties page.'}
        inputs={[
          {
            name: 'userid',
            type: 'text',
            id: 'adduserid',


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
              partyService.addUser(data.userid, project);
              hideAddUser();
            }
          }
        ]}
      />
    </IonCard>
  )

}
export default PartyMembersListComponent;