import React, { useState } from 'react';
import { IonItem, IonLabel, IonIcon, IonInput, IonTextarea, IonButton, 
  IonHeader, IonTitle, IonToolbar, IonContent, IonFooter, 
  IonRange, IonFab, 
  IonFabButton, IonAlert, IonSegment, IonSegmentButton } from '@ionic/react';
import { ChallengeIntervals, Challenge, ChallengeDifficulty } from '../models';
import { capitalize } from '../../../utils';
import { COLOR_DANGER } from '../../../colors';
import { trash } from 'ionicons/icons';
import ulog from 'ulog';

const log = ulog('party');


interface challengeState {
  regularity: {
    interval: ChallengeIntervals,
    min: number,
    max: number,
  }
  doc: Challenge,
  showDeleteWarrning: boolean
}

const getRegularityValues = (interval: ChallengeIntervals) => {
  switch (interval) {
    case ChallengeIntervals.day:
      return {interval: interval, min:1, max: 1}
    case ChallengeIntervals.week:
      return {interval: interval, min:1, max: 6}
    case ChallengeIntervals.month:
      return {interval: interval, min:1, max: 25}
  }
}

const ChallengeAddComponent = ({challenge, dismissFunc}:
  {challenge:Challenge|null, dismissFunc: {(challenge:Challenge|null, action: 'save'|'remove'|'none')}}) => {
  const _challenge = challenge|| new Challenge();
  const getDefaultRegularityState: challengeState = {
    regularity: getRegularityValues(_challenge.regularityInterval),
    doc: _challenge,
    showDeleteWarrning: false
  }
  const [state, setState] = useState<challengeState>({...getDefaultRegularityState, ...{doc: _challenge}});


  const handleChange = (e) => {
    const newDoc = {...state.doc, ...{[e.target.name]:e.detail.value}}
    const newState = {...state, ...{doc: newDoc}};
    setState(newState);
  }

  const handlerRegularityValue = (e) => {
    const newDoc = {...state.doc, ...{regularityValue: e.detail.value}};
    setState({...state, ...{doc: newDoc}});
  }

  const handlerRegularityIntervalChange = (value) => {
    value = value || 'day';
    const newDoc = {...state.doc, ...{regularityInterval: value, regularityValue: 1}};
    const newReg = {...state.regularity, ...getRegularityValues(value)};
    setState({...state, ...{doc:newDoc, regularity: newReg}});
  }

  const printRegularityLabel = () => {

    const times = (state.doc.regularityIntervalGoal > 1)? ' times a ': ' time a ';
    if(state.doc.regularityInterval === 'day'){
      return 'I will repeat this task every day.'
    }
    
    return 'I will repeat this task ' + state.doc.regularityIntervalGoal + times + state.doc.regularityInterval
  }

  const handleDifficultyChange = (e) => {
    const newDoc = {...state.doc, ...{difficulty: e.detail.value}};
    setState({...state, ...{doc: newDoc}});
  }

  const printDifficultyLabel = (chdiff: ChallengeDifficulty): string => {
    switch(chdiff) {
      case ChallengeDifficulty.trivial:
        return 'Easy peasy lemon squeezy';
      case ChallengeDifficulty.easy:
        return 'Piece of Cake';
      case ChallengeDifficulty.medium:
        return "Let's Rock";
      case ChallengeDifficulty.hard:
        return 'No Pain, No Gain';
      case ChallengeDifficulty.extreme:
        return 'Death Wish';
    }
  }

  const showRemoveWarrning = () => {
    setState({...state, ...{showDeleteWarrning: true}});
  }

  const hideRemoveWarrning = () => {
    setState({...state, ...{showDeleteWarrning: false}});
  }

  const removehabit = () => {
    hideRemoveWarrning();
    dismissFunc(state.doc, 'remove');
  }



  const print = () => {
      return (
      <>
        <IonHeader>
          <IonToolbar>
            {/*
            <IonButtons slot="start">
              <IonButton> <IonIcon size="large" icon={arrowBack} /></IonButton>
            </IonButtons>
            */}
            <IonTitle>Add Challenge</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonItem>
              <IonLabel position="floating">Name</IonLabel>
              <IonInput 
                  name="name"
                  placeholder="Read book, Go running ..." 
                  onIonChange={handleChange}
                  value={state.doc.name} />
          </IonItem>
          <IonItem>
              <IonLabel position="floating">Note</IonLabel>
              <IonTextarea 
                  placeholder="Enter more information here, motivate yourself..."
                  name="note"
                  onIonChange={handleChange}
                  value={state.doc.note}></IonTextarea>
          </IonItem>
          <IonItem>
            <IonSegment value={state.doc.regularityInterval}
                        onIonChange={(e) => handlerRegularityIntervalChange(e.detail.value)}>
              <IonSegmentButton value="day">
                <IonLabel>Daily</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="week">
                <IonLabel>Weekly</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="month">
                <IonLabel>Monthly</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </IonItem>

          {(state.doc.regularityInterval !== 'day')? (
            <>
              <IonRange 
                    min={state.regularity.min}
                    max={state.regularity.max}
                    debounce={100}
                    value={state.doc.regularityIntervalGoal}
                    onIonChange={handlerRegularityValue}
                    color="secondary" >
                <IonLabel slot="start">{state.regularity.min}</IonLabel>
                <IonLabel slot="end">{state.regularity.max}</IonLabel>
              </IonRange>
            </>
          ) : (
          <></> )}
          <IonItem>
            <IonLabel>{printRegularityLabel()}</IonLabel>
          </IonItem>

          <IonRange min={0} 
                    max={4} 
                    debounce={100}
                    value={state.doc.difficulty}
                    onIonChange={handleDifficultyChange}
                    color="secondary">
              <IonLabel slot="start">{capitalize(printDifficultyLabel(ChallengeDifficulty.trivial))}</IonLabel>
              <IonLabel slot="end">{capitalize(printDifficultyLabel(ChallengeDifficulty.extreme))}</IonLabel>
          </IonRange>

          <IonItem>
            <IonLabel>{printDifficultyLabel(state.doc.difficulty)}</IonLabel>
          </IonItem>
        </IonContent> 

        <IonFooter>
          <IonToolbar>
            <IonTitle>
              <IonButton onClick={() => dismissFunc(state.doc, 'save')}>Save</IonButton>
              <IonButton onClick={() => dismissFunc(null, 'none')}>Cancel</IonButton>
            </IonTitle>
          </IonToolbar>
        </IonFooter>
        <IonFab horizontal="end" vertical="bottom" >
          <IonFabButton size="small" color={COLOR_DANGER} onClick={() => showRemoveWarrning()}>
            <IonIcon size="large" icon={trash} />
          </IonFabButton>
        </IonFab>
        <IonAlert
          isOpen={state.showDeleteWarrning}
          onDidDismiss={() => hideRemoveWarrning}
          header={'Warrning!!!'}
          message={'Are you sure you want to <strong>delete</strong> this habit?'}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary',
              
            },
            {
              text: 'Yes Im Sure',
              handler: () => removehabit()
            }
          ]}
        />
      </>
      );
  }
  
  return print();
};

export default ChallengeAddComponent;
