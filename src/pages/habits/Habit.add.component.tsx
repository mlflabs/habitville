import React, { useState } from 'react';
import { IonItem, IonLabel, IonIcon, IonInput, IonTextarea, IonButton, IonHeader, IonTitle, IonToolbar, IonContent, IonFooter, IonButtons, IonSelect, IonSelectOption, IonRange, IonFab, IonFabButton, IonAlert, IonSegment, IonSegmentButton } from '@ionic/react';
import { arrowBack, trash } from '../../../node_modules/ionicons/icons';
import { Habit, habitIntervals, habitDifficulty, printDifficulty } from './models';
import { capitalize } from '../../utils';
import { COLOR_DANGER } from '../../colors';



interface habitState {
  regularity: {
    interval: habitIntervals,
    min: number,
    max: number,
  }
  doc: Habit,
  showDeleteWarrning: boolean
}

const getRegularityValues = (interval: habitIntervals) => {
  switch (interval) {
    case habitIntervals.day:
      return {interval: interval, min:1, max: 1}
    case habitIntervals.week:
      return {interval: interval, min:1, max: 6}
    case habitIntervals.month:
      return {interval: interval, min:1, max: 25}
  }
}

const HabitAddComponent = ({habit, dismissFunc}:
  {habit:Habit, dismissFunc: {(habit:Habit|null, action: 'save'|'remove'|'none')}}) => {
  console.log('Add habits Form:::::: ', habit);
  const getDefaultRegularityState: habitState = {
    regularity: getRegularityValues(habit.regularityInterval),
    doc: new Habit(),
    showDeleteWarrning: false
  }


  const [state, setState] = useState<habitState>({...getDefaultRegularityState, ...{doc: habit}});



  console.log(state);
  const handleChange = (e) => {
    const newDoc = {...state.doc, ...{[e.target.name]:e.detail.value}}
    const newState = {...state, ...{doc: newDoc}};
    setState(newState);
  }

  const handlerRegularityValue = (e) => {
    console.log(e);
    const newDoc = {...state.doc, ...{regularityValue: e.detail.value}};
    setState({...state, ...{doc: newDoc}});
  }

  const handlerRegularityIntervalChange = (value) => {
    value = value || 'day';
    const newDoc = {...state.doc, ...{regularityInterval: value, regularityValue: 1}};
    const newReg = {...state.regularity, ...getRegularityValues(value)};
    setState({...state, ...{doc:newDoc, regularity: newReg}});
    console.log(state);
  }

  const printRegularityLabel = () => {

    const times = (state.doc.regularityValue > 1)? ' times a ': ' time a ';
    if(state.doc.regularityInterval === 'day'){
      return 'I will repeat this habit every day.'
    }
    
    return 'I will repeat this habit ' +state.doc.regularityValue + times + state.doc.regularityInterval
  }

  const handleDifficultyChange = (e) => {
    const newDoc = {...state.doc, ...{difficulty: e.detail.value}};
    setState({...state, ...{doc: newDoc}});
  }

  const printDifficultyLabel = (hab: habitDifficulty): string => {
    switch(hab) {
      case habitDifficulty.trivial:
        return 'Easy peasy lemon squeezy';
      case habitDifficulty.easy:
        return 'Piece of Cake';
      case habitDifficulty.medium:
        return "Let's Rock";
      case habitDifficulty.hard:
        return 'No Pain, No Gain';
      case habitDifficulty.extreme:
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
    console.log('REMVE ACTION STATE::::::: ', state);
    dismissFunc(state.doc, 'remove');
  }

  const checkForm = () => {
    
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
            <IonTitle>Add Habit</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonItem>
              <IonLabel position="floating">Name</IonLabel>
              <IonInput 
                  name="title"
                  placeholder="Read book, Go running ..." 
                  onIonChange={handleChange}
                  value={state.doc.title} />
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
                    value={state.doc.regularityValue}
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
              <IonLabel slot="start">{capitalize(printDifficulty(habitDifficulty.trivial))}</IonLabel>
              <IonLabel slot="end">{capitalize(printDifficulty(habitDifficulty.extreme))}</IonLabel>
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
  
  console.log("Ready to return form");
  return print();
};

export default HabitAddComponent;

