import React, { useReducer } from 'react';
import { PartyProject, PartyMember } from '../models';
import { IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonList, IonItem, IonAlert, IonFooter, IonButton, IonLabel, IonBadge } from '@ionic/react';
import { partyService } from '../party.service';
import  ulog from 'ulog';
import { authService } from '../../auth/authService';
import { canEditProjectByRights } from '../../data/utilsData';
import { COLOR_LIGHT, COLOR_SUCCESS, COLOR_SECONDARY } from '../../../colors';
import ChallengeMemberScoreHistory from './Challenge.member.scoreHistory';
const log = ulog('memberlist');

export interface MembersState {
  showAddModal: boolean,
  members: PartyMember[],
}


const reducer = (state, action): MembersState => {
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

const PartyMembersListComponent = ({project}:{project:PartyProject}) => {
  const [state, _dispatch] = useReducer(reducer, {
    showAddModal: false,
    members: [],
  })

  const dispatch = (type: 'showAddMemberModal'|
                          'hideAddMemberModal', 
                    data:any = {}) => {
    _dispatch({type, data});
  }

  const addMember = () => {
    dispatch("showAddMemberModal");
    
  }

  const hideAddUser = () => {
    dispatch('hideAddMemberModal');
  }

  const canEditThisProject = () => {
    const self = project.members.find(m => m.id === authService.userid);
    if(!self) return false;
    return canEditProjectByRights(self.rights);
  }

  const printScore = (score, index) =>{
    let color = COLOR_LIGHT;
    if(index === 0) color = COLOR_SUCCESS;
    if(index === 1) color = COLOR_SECONDARY;
    return <IonBadge slot="end" color={color}>{score.exp}</IonBadge>
  }

  
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Members</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList>
            {project.members.sort((a,b) => b.score.exp - a.score.exp)
                            .map((member, i) => (
          <IonItem key={member.id}>
            <IonLabel>
              <h2>{member.username} - 
                  <ChallengeMemberScoreHistory member={member}  />
              </h2>
            </IonLabel>
              {printScore(member.score, i)}
          </IonItem>
            ))}
        </IonList>
        
      </IonCardContent>
      {canEditThisProject()? (
        <IonFooter>
          <IonButton onClick={()=>addMember()} fill="clear">Invite</IonButton>
        </IonFooter>
      ) : ( <></>)}
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