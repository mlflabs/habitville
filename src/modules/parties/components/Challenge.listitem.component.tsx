import React, { useEffect, useReducer } from 'react';
import { IonItem, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonNote, IonFooter, IonButton, IonLabel, 
   IonFab, IonFabButton, IonIcon, IonAlert, IonModal } from '@ionic/react';
import { Challenge, ChallengeState, ChallengeType, ChallengeTypeUnit, ChallengeMember, ChallengeAction } from '../models';
import ulog from 'ulog';
import { partyService } from '../party.service';
import { authService } from '../../auth/authService';
import ChallengeMembersItem from './Challenge.members.item.component';
import { canEditProject } from '../../data/utilsData';
import { cog, checkmarkDone, readerOutline, cafeOutline, walkOutline, alarmOutline, timerOutline, rocketOutline, cashOutline, trendingDown, trendingUp } from 'ionicons/icons';
import { COLOR_SUCCESS, COLOR_LIGHT } from '../../../colors';
import ChallengeAddActionNoteComponent from './Challenge.add.note.action.component';
import { MOMENT_DATE_FORMAT } from '../../../pages/habits/models';
import moment from 'moment';

const log = ulog('clubs');

export interface ChallengeLocalState {
  challenge: Challenge,
  showDoneAlert: boolean,
  memberDoc: ChallengeMember|undefined,
  currentDate: string,
  showBiggesGainerAcceptAlert: boolean,
  showBiggesLooserAcceptAlert: boolean
}

const reducer = (state, action): ChallengeLocalState => {
  switch(action.type) {
    case 'setMemberDoc':
      return {...state, ...{memberDoc: action.data}};
    case 'challenge':
      return {...state, ...{challenge:action.data, 
                            memberDoc: action.data.members
                            .find(m => m.id === authService.userid)}}
    case 'showDoneAlert':
        return {...state, ...{showDoneAlert:true, }}
    case 'hideDoneAlert':
        return {...state, ...{showDoneAlert:false}}
    case 'showBiggestLooserAcceptAlert':
        return {...state, ...{showBiggesLooserAcceptAlert:action.data}}
    case 'showBiggestGainerAcceptAlert':
        return {...state, ...{showBiggesGainerAcceptAlert:action.data}}

    default:
      console.log('ERROR WENT TO DEFAULTS:: ', action);
      return state;
  }
}


const ChallengeListItemComponent = ({challenge, showEditModalFunction}:
  {challenge:Challenge, showEditModalFunction:{(challenge: Challenge)}}) => {

  const [state, _dispatch] = useReducer(reducer, {
    challenge,
    showDoneAlert: false,
    showBiggesLooserAcceptAlert: false,
    showBiggesGainerAcceptAlert: false,
    currentDate: moment().format(MOMENT_DATE_FORMAT),
    memberDoc: challenge.members.find(m => m.id === authService.userid)
  })

  const dispatch = (type: 'challenge'|
                          'setMemberDoc'|
                          'showBiggestGainerAcceptAlert'|
                          'showBiggestLooserAcceptAlert'|
                          'hideDoneAlert'|
                          'showDoneAlert', data:any = {}) => {
    _dispatch({type, data});
  }

  useEffect(() => {
    dispatch('challenge', challenge);
  }, [challenge])

  const printTitle = () => {
    if(state.challenge.state === ChallengeState.waiting){
      return <IonCardTitle>{state.challenge.name} - Open to joining</IonCardTitle>
    }
    else if(state.challenge.state === ChallengeState.current){
      return <IonCardTitle>{state.challenge.name} </IonCardTitle>
    }
    else if(state.challenge.state === ChallengeState.finished) {
      return <IonCardTitle>{state.challenge.name} - Finished</IonCardTitle>
    }
    else if(state.challenge.state === ChallengeState.future) {
      return <IonCardTitle>{state.challenge.name} - Preivew of future challenge</IonCardTitle>
    }
    return <IonCardTitle>{state.challenge.name}</IonCardTitle>
  }

  const printInfo = () => {
    if(state.challenge.regularityInterval === 'day'){
      return (
        <IonItem>
          <IonLabel>
            <h2>{state.challenge.note}</h2>
            <IonNote>
              Challenge goal, for <strong>every day</strong>.
            </IonNote>
          </IonLabel>
        </IonItem>
      )
    }
    
    return (
      <IonItem>
        <IonLabel>
          <h2>{state.challenge.note}</h2>
          <IonNote>
            Challenge goal is for 
            <strong> {state.challenge.regularityIntervalGoal} times {state.challenge.regularityInterval}</strong>
          </IonNote>
        </IonLabel>
      </IonItem>
    )
  }

  const challengeSubmitForToday = () => {

    return false;
  }



  const printActionButtons = () => {
    if(state.challenge.state === ChallengeState.waiting && state.memberDoc === undefined){
      if(state.challenge.challengeType === ChallengeType.looser){
        return <IonButton size="small"   fill="clear"
                    onClick={() => dispatch('showBiggestLooserAcceptAlert', true)} >
                    Accept Challenge</IonButton>
      }
      else if(state.challenge.challengeType === ChallengeType.gainer){
        return <IonButton size="small"   fill="clear"
                    onClick={() => dispatch('showBiggestGainerAcceptAlert', true)} >
                    Accept Challenge</IonButton>
      }
      else{
        return <IonButton size="small"   fill="clear"
                    onClick={() => partyService.acceptChallenge(state.challenge)} >
                    Accept Challenge</IonButton>
      }
    }
    else if(state.challenge.state === ChallengeState.current){
      if(challengeSubmitForToday()) return;
      return;
    }
    else if(state.challenge.state === ChallengeState.finished) {

    }
    else if(state.challenge.state === ChallengeState.future) {

    }

  }

  const printSubmitFab = () => {
    if(state.challenge.state === ChallengeState.current){
      if(challengeSubmitForToday() && state.challenge.regularityEachDayGoal > 1) return;
     return <IonFab horizontal="end" vertical="top" >
              <IonFabButton onClick={() => dispatch('showDoneAlert')}
                            color={COLOR_SUCCESS}  >
                {printDoneIcon()}
              </IonFabButton>
            </IonFab>
    }
  }

  const printEditFabButton = () => {
    if(!canEditProject(state.challenge.id, authService.getUser())) return;
    return <IonFab horizontal="end" vertical="bottom" edge>
              <IonFabButton size="small" 
                            onClick={() => showEditModalFunction(state.challenge)}
                            color={COLOR_LIGHT}  >
                <IonIcon size="large" icon={cog} />
              </IonFabButton>
            </IonFab>
  }

  const printAdminActionButtons = () => {
    if(!canEditProject(state.challenge.id, authService.getUser())) return;
    if(state.challenge.state === ChallengeState.waiting){
      return <>
              <IonButton size="small" fill="clear"
                onClick={() => partyService.changeChallengeState(state.challenge.id, ChallengeState.current)} >
                Start Challenge</IonButton>
              <IonButton size="small" fill="clear"
                onClick={() => partyService.changeChallengeState(state.challenge.id, ChallengeState.waiting)} >
                Freeze For Future Use</IonButton>
            </>
    }
    else if(state.challenge.state === ChallengeState.current){

    }
    else if(state.challenge.state === ChallengeState.finished) {

    }
    else if(state.challenge.state === ChallengeState.future) {

    }

  }

  const printDoneIcon = () => {
    if(state.challenge.challengeType === ChallengeType.checkin)
      return <IonIcon size="large" icon={checkmarkDone} />
    if(state.challenge.challengeType === ChallengeType.note)
      return <IonIcon size="large" icon={readerOutline} />
    if(state.challenge.challengeType === ChallengeType.value &&
        state.challenge.challengeTypeUnit === ChallengeTypeUnit.Cup)
      return <IonIcon size="large" icon={cafeOutline} />
    if(state.challenge.challengeType === ChallengeType.value &&
        state.challenge.challengeTypeUnit === ChallengeTypeUnit.Kilometer)
      return <IonIcon size="large" icon={walkOutline} />
    if(state.challenge.challengeType === ChallengeType.value &&
        state.challenge.challengeTypeUnit === ChallengeTypeUnit.Hour)
      return <IonIcon size="large" icon={alarmOutline} />
    if(state.challenge.challengeType === ChallengeType.value &&
        state.challenge.challengeTypeUnit === ChallengeTypeUnit.Minute)
      return <IonIcon size="large" icon={timerOutline} />
    if(state.challenge.challengeType === ChallengeType.value &&
        state.challenge.challengeTypeUnit === ChallengeTypeUnit.Dollar)
      return <IonIcon size="large" icon={cashOutline} />
    if(state.challenge.challengeType === ChallengeType.looser)
      return <IonIcon size="large" icon={trendingDown} />
    if(state.challenge.challengeType === ChallengeType.gainer)
      return <IonIcon size="large" icon={trendingUp} />

    return <IonIcon size="large" icon={rocketOutline} />
  }


  const closeModal = () => {
    log.info('Close modal');
    dispatch('hideDoneAlert');
  }

  const submitModal = (action: ChallengeAction)  => {
    log.info('Submit modal::: ', action);
    partyService.submitChallengeActions(state.challenge.id, [action])
    dispatch('hideDoneAlert');
  }

  const getCurrentAction = () => {
    if(state.memberDoc === undefined) 
      return {date: state.currentDate, value: 0, data:{}, reward: {value: 0}}
    const cAction = state.memberDoc.actions[state.currentDate];
    if(!cAction)
      return {date: state.currentDate, value: 0, data:{}, reward: {value: 0}}
    if(!cAction.data) cAction.data = {};
    return cAction;
  }




  const print = () => {
    return (
        <IonCard>
          <IonCardHeader>
            {/*<IonCardSubtitle>Card Subtitle</IonCardSubtitle>*/}
            {printTitle()}
          </IonCardHeader>
          <IonCardContent>
            <ChallengeMembersItem challenge={state.challenge} />
            {printInfo()}
          </IonCardContent>
          <IonFooter>
            {printActionButtons()}
            {printAdminActionButtons()}
          </IonFooter>

          
          {printEditFabButton()}
          {printSubmitFab()}

          <IonModal isOpen={(state.showDoneAlert && 
              state.challenge.challengeType === ChallengeType.note)} 
              onDidDismiss={() => closeModal()}>
            <ChallengeAddActionNoteComponent 
                  doc={getCurrentAction()} 
                  closeFunc = {() => closeModal()}
                  submitFunc = {submitModal}  />
            </IonModal>

          
          <IonAlert 
            isOpen={(state.showDoneAlert && state.challenge.challengeType === ChallengeType.value)}
            onDidDismiss={() => dispatch('hideDoneAlert')}
            header="Submit Action:"
            inputs={[
              {
                name: 'value',
                type: 'number',
                min: 0,
                value: Number(getCurrentAction().value)+1
              },
            ]}
            buttons={[
              {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {
                  dispatch('hideDoneAlert');
                }
              },
              {
                text: 'Submit',
                handler: (data) => {
                  console.log(data);
                  dispatch('hideDoneAlert');
                  submitModal({...getCurrentAction(), ...{value: data.value}})
                }
              }
            ]}
          />


          <IonAlert 
            isOpen={(state.showDoneAlert && 
              (state.challenge.challengeType === ChallengeType.looser ||
               state.challenge.challengeType === ChallengeType.gainer))}
            onDidDismiss={() => dispatch('hideDoneAlert')}
            header="Submit Current Value:"
            inputs={[
              {
                name: 'currentValue',
                type: 'number',
                min: 0,
                value: Number(getCurrentAction().value)+1
              },
            ]}
            buttons={[
              {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {
                  dispatch('hideDoneAlert');
                }
              },
              {
                text: 'Submit',
                handler: (data) => {
                  console.log(data);
                  dispatch('hideDoneAlert');
                  submitModal({...getCurrentAction(), ...{value: 1, currentValue: data.currentValue}})
                }
              }
            ]}
          />


          <IonAlert 
            isOpen={(state.showDoneAlert && state.challenge.challengeType === ChallengeType.checkin)}
            onDidDismiss={() => dispatch('hideDoneAlert')}
            header="Submit Action:"
            inputs={[
              {
                name: 'checkbox1',
                id: 'checkbox1',
                type: 'checkbox',
                label: 'Check-In',
                value: '1',
                checked: false
              },
            ]}
            buttons={[
              {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {
                  dispatch('hideDoneAlert');
                }
              },
              {
                text: 'Submit',
                handler: (data) => {
                  console.log(data);
                  if(data[0]){
                    console.log('Checked in');
                    dispatch('hideDoneAlert');
                    submitModal({...getCurrentAction(), ...{value: 1}})
                  }
                  else{
                    console.log('Failed');
                    dispatch('hideDoneAlert');
                  }
                }
              }
            ]}
          />



          <IonAlert 
            isOpen={(state.showBiggesGainerAcceptAlert)}
            onDidDismiss={() => dispatch('showBiggestGainerAcceptAlert', false)}
            header="Submit Action:"
            subHeader="Starting value is private, only used to calculate progress."
            inputs={[
              {
                name: 'startingValue',
                type: 'number',
                label: 'Starting Value',
              },
            ]}
            buttons={[
              {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {
                  dispatch('showBiggestGainerAcceptAlert', false);
                }
              },
              {
                text: 'Submit',
                handler: (data) => {
                  console.log(data);
                  if(data.startingValue){
                    dispatch('showBiggestGainerAcceptAlert', false);
                    partyService.acceptChallenge(state.challenge, data)
                  }
                  else{
                    dispatch('showBiggestGainerAcceptAlert', false);
                  }
                }
              }
            ]}
          />

          <IonAlert 
            isOpen={(state.showBiggesLooserAcceptAlert)}
            onDidDismiss={() => dispatch('showBiggestLooserAcceptAlert', false)}
            header="Submit Action:"
            subHeader="Starting value is private, only used to calculate progress."
            inputs={[
              {
                name: 'startingValue',
                type: 'number',
                label: 'Starting Value',
              },
            ]}
            buttons={[
              {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
                handler: () => {
                  dispatch('showBiggestLooserAcceptAlert', false);
                }
              },
              {
                text: 'Submit',
                handler: (data) => {
                  console.log(data);
                  if(data.startingValue){
                    dispatch('showBiggestLooserAcceptAlert', false);
                    partyService.acceptChallenge(state.challenge, data)
                  }
                  else{
                    dispatch('showBiggestLooserAcceptAlert', false);
                  }
                }
              }
            ]}
          />


        </IonCard>
    );
  }
  
  return print();
};

export default ChallengeListItemComponent;

