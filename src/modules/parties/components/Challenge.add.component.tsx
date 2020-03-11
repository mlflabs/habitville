import React, { useState, useReducer, useEffect } from 'react';
import { IonItem, IonLabel, IonIcon, IonInput, IonTextarea, IonButton, 
  IonHeader, IonTitle, IonToolbar, IonContent, IonFooter, 
  IonRange, IonFab, 
  IonFabButton, IonAlert, IonSegment, IonSegmentButton, IonSelectOption, IonSelect, IonCheckbox, IonNote } from '@ionic/react';
import { ChallengeIntervals, Challenge, ChallengeDifficulty, ChallengeType, ChallengeTypeUnit } from '../models';
import { capitalize } from '../../../utils';
import { COLOR_DANGER, COLOR_SUCCESS, COLOR_SECONDARY, COLOR_LIGHT } from '../../../colors';
import { trash } from 'ionicons/icons';
import ulog from 'ulog';
import './challenge.css'

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


const reducer = (state, {type, payload}): challengeState => {
  switch(type) {
    case 'challengeChange':
      const newDoc = {...state.doc, ...payload}
      return {...state, ...{doc: newDoc}};
    case 'stateChange':
      return payload;
    case 'showRemoveWarrning':
      return {...state, ...{showDeleteWarrning: true}};
    case 'hideRemoveWarrning':
      return {...state, ...{showDeleteWarrning: false}};

    default:
      log.error('Action type is not a match');
      return state;
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
  log.warn('ADDDD', challenge);
  const [state, _dispatch] = useReducer(reducer, getDefaultRegularityState)


  useEffect(() => {
    log.warn('USE EFFECT ADD:: ', challenge);
    dispatch('challengeChange', challenge);
  }, [challenge])

  const dispatch = (type: 'challengeChange'|
                          'stateChange'|
                          'showRemoveWarrning'|
                          'hideRemoveWarrning',
                    payload:any = {}) => {
  _dispatch({type, payload});
  }


  const handleChange = (e) => {
    log.info(e);
    const newDoc = {...state.doc, ...{[e.target.name]:e.detail.value}}
    dispatch('challengeChange', newDoc)
  }

  const handleNamedChange = (property, value) => {
    const newDoc = {...state.doc, ...{[property]: value}}
    dispatch('challengeChange', newDoc)
  }

  const handlerRegularityValue = (e) => {
    console.log(e);
    const newDoc = {...state.doc, ...{regularityIntervalGoal: e.detail.value}};
    dispatch('challengeChange', newDoc)
  }

  const handlerRegularityIntervalChange = (value) => {
    value = value || 'day';
    const newDoc = {...state.doc, ...{regularityInterval: value, regularityValue: 1}};
    const newReg = {...state.regularity, ...getRegularityValues(value)};
    dispatch('stateChange', {...state, ...{doc:newDoc, regularity: newReg}});
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
    dispatch('challengeChange', newDoc)
  }

  const handleMultiplierChange = (e) => {
    if(Number(e.detail.value) <= 0 ) return;
    const newDoc = {...state.doc, ...{challengePointMultiplier: Number(e.detail.value)}};
    dispatch('challengeChange', newDoc)
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

  const removehabit = () => {
    dispatch('showRemoveWarrning');
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

          <div>
            <IonButton 
              onClick={()=>handleNamedChange('challengeType', ChallengeType.checkin)}
              color={(state.doc.challengeType === ChallengeType.checkin)?COLOR_SUCCESS : COLOR_LIGHT} >
                Check-In</IonButton>
            <IonButton 
              onClick={()=>handleNamedChange('challengeType', ChallengeType.value)}
              color={(state.doc.challengeType === ChallengeType.value)?COLOR_SUCCESS : COLOR_LIGHT} >
                Value</IonButton>
            <IonButton 
              onClick={()=>handleNamedChange('challengeType', ChallengeType.note)}
              color={(state.doc.challengeType === ChallengeType.note)?COLOR_SUCCESS : COLOR_LIGHT} >
                Note</IonButton>
            <IonButton 
              onClick={()=>handleNamedChange('challengeType', ChallengeType.gainer)}
              color={(state.doc.challengeType === ChallengeType.gainer)?COLOR_SUCCESS : COLOR_LIGHT} >
                Biggest Gainer</IonButton>
            <IonButton 
              onClick={()=>handleNamedChange('challengeType', ChallengeType.looser)}
              color={(state.doc.challengeType === ChallengeType.looser)?COLOR_SUCCESS : COLOR_LIGHT} >
                Biggest Looser</IonButton>
          </div>

          {(state.doc.challengeType === 'Value')? (
            <>
            <IonItem>
                  <IonLabel>Unit</IonLabel>
                  <IonSelect  value={state.doc.challengeTypeUnit}
                              onIonChange={(e) => handleNamedChange('challengeTypeUnit', e.detail.value)}
                              color={COLOR_SECONDARY}
                              placeholder="Select One">
                    <IonSelectOption value="Cup">Cup</IonSelectOption>
                    <IonSelectOption value="Dollar">Dollar</IonSelectOption>
                    <IonSelectOption value="Page">Page</IonSelectOption>
                    <IonSelectOption value="Minute">Minute</IonSelectOption>
                    <IonSelectOption value="Hour">Hour</IonSelectOption>
                    <IonSelectOption value="Meter">Meter</IonSelectOption>
                    <IonSelectOption value="Kilometer">Kilometer</IonSelectOption>
                    <IonSelectOption value="Other">Other</IonSelectOption>
                  </IonSelect>               
            </IonItem>
            <IonItem>
                  <IonLabel position="floating">Value</IonLabel>
                  <IonInput type="number" 
                            name="regularityEachDayGoal"
                            onIonChange={handleChange}
                            value={state.doc.regularityEachDayGoal}/>
            </IonItem>
            </>
          ) : (<></>)}
          {(state.doc.challengeType === 'Value' &&
            state.doc.challengeTypeUnit === ChallengeTypeUnit.Other)? (
            <IonItem>
                  <IonLabel position="floating">Unit</IonLabel>
                  <IonInput name="chalengeTypeOther"
                            onIonChange={handleChange}
                            value={state.doc.chalengeTypeOther}/>
            </IonItem>
          ) : (<></>)}

          {(state.doc.challengeType === ChallengeType.looser)? (
            <IonItem>
                  <IonLabel className="paddingDown" position="floating">
                    <h2>Multiplier</h2>
                    <IonNote  className="ion-text-wrap">
                      Points will be calculated based on progress times multiplier. For example
                      if multiplier is 5, and first day your proggress is 5 less than starting value, 
                      then the points gained would be 25 (5 x 5 = 25)
                    </IonNote>
                  </IonLabel>
                  <IonInput name="challengePointMultiplier"
                            type='number'
                            onIonChange={handleMultiplierChange}
                            value={state.doc.challengePointMultiplier}/>
            </IonItem>
          ) : (<></>)}

          {(state.doc.challengeType === ChallengeType.gainer)? (
            <IonItem>
                  <IonLabel className="paddingDown" position="floating">
                    <h2>Multiplier</h2>
                    <IonNote  className="ion-text-wrap">
                      Points will be calculated based on progress times multiplier. For example
                      if multiplier is 5, and first day your proggress is 2 more than starting value, 
                      then the points gained would be 25 (5 x 2 = 10)
                    </IonNote>
                  </IonLabel>
                  <IonInput name="challengePointMultiplier"
                            type='number'
                            onIonChange={handleMultiplierChange}
                            value={state.doc.challengePointMultiplier}/>
            </IonItem>
          ) : (<></>)}



          {(state.doc.challengeType ===  ChallengeType.note)? (
            <IonItem>
              <IonLabel>Vote Enabled: </IonLabel>
              <IonCheckbox  name = "chalengeTypeNoteVote"
                            onIonChange={(e) => handleNamedChange('chalengeTypeNoteVote', e.detail.checked)}
                            checked={state.doc.chalengeTypeNoteVote} />
            </IonItem>

          ) : (<></>)}
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
          <IonFabButton size="small" color={COLOR_DANGER} onClick={() => dispatch('showRemoveWarrning')}>
            <IonIcon size="large" icon={trash} />
          </IonFabButton>
        </IonFab>
        <IonAlert
          isOpen={state.showDeleteWarrning}
          onDidDismiss={() => dispatch('hideRemoveWarrning')}
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
