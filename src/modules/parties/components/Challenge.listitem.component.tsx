import React, { useEffect, useReducer } from 'react';
import { IonItem, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonNote, IonFooter, IonButton, IonLabel } from '@ionic/react';
import { Challenge, ChallengeState } from '../models';
import ulog from 'ulog';
import { partyService } from '../party.service';
import { authService } from '../../auth/authService';
import ChallengeMembersItem from './Challenge.members.item.component';
import { canEditProject } from '../../data/utilsData';

const log = ulog('clubs');

export interface ChallengeLocalState {
  challenge: Challenge,
}

const reducer = (state, action): ChallengeLocalState => {
  switch(action.type) {
    case 'challenge':
      return {...state, ...{challenge:action.data}}

    default:
      console.log('ERROR WENT TO DEFAULTS:: ', action);
      return state;
  }
}


const ChallengeListItemComponent = ({challenge, showEditModalFunction}:
  {challenge:Challenge, showEditModalFunction:{(challenge: Challenge)}}) => {

  const [state, _dispatch] = useReducer(reducer, {
    challenge,
  })

  const dispatch = (type:'challenge', data:any) => {
    _dispatch({type, data});
  }

  useEffect(() => {
    dispatch('challenge', challenge);
  }, [challenge])

  const joined = challenge.members.find(m => m.id === authService.userid);

  log.info('Challenge Item: ', state);

  const printTitle = () => {
    if(state.challenge.state === ChallengeState.waiting){
      return <IonCardTitle>{state.challenge.name} - Join if you dare</IonCardTitle>
    }
    else if(state.challenge.state === ChallengeState.current){
      return <IonCardTitle>{state.challenge.name} - In progress</IonCardTitle>
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
    if(state.challenge.state === ChallengeState.waiting && joined === undefined){
      return <IonButton size="small" onClick={() => partyService.acceptChallenge(state.challenge)} >
            Accept Challenge</IonButton>
    }
    else if(state.challenge.state === ChallengeState.current){
      if(challengeSubmitForToday()) return;
      return <IonButton size="small" 
        onClick={() => partyService.submitChallengeActions(state.challenge.id, 1)} >
            Done</IonButton>
    }
    else if(state.challenge.state === ChallengeState.finished) {

    }
    else if(state.challenge.state === ChallengeState.future) {

    }

  }

  const printAdminActionButtons = () => {
    if(!canEditProject(state.challenge.id, authService.getUser())) return;
    if(state.challenge.state === ChallengeState.waiting){
      return <>
              <IonButton size="small" 
                onClick={() => partyService.changeChallengeState(state.challenge.id, ChallengeState.current)} >
                Start Challenge</IonButton>
              <IonButton size="small" 
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
         {/* 
          <IonFab horizontal="end" vertical="bottom" edge>
            <IonFabButton size="small" color={COLOR_LIGHT} onClick={() => showEditModalFunction(doc)}>
              <IonIcon size="large" icon={cog} />
            </IonFabButton>
          </IonFab>
        */}
        </IonCard>
    );
  }
  
  return print();
};

export default ChallengeListItemComponent;

