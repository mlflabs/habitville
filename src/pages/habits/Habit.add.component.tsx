import React, { useState } from 'react';
import { IonItem, IonLabel, IonIcon, IonInput, IonTextarea, IonButton, IonHeader, IonTitle, IonToolbar, IonContent, IonFooter, IonButtons, IonSelect, IonSelectOption, IonRange, IonFab, IonFabButton, IonAlert, IonSegment, IonSegmentButton } from '@ionic/react';
import { trash } from '../../../node_modules/ionicons/icons';
import { Habit, habitIntervals, habitDifficulty, printDifficulty } from './models';
import { capitalize } from '../../utils';
import { COLOR_DANGER } from '../../colors';
import { gamifyService } from '../../modules/gamify/gamifyService';

import './habit.css';
import { MarketItem } from '../../modules/market/models';
import { useTranslation } from 'react-i18next';
import { HelpTooltip } from '../../components/tooltip';
import { getPlantSeedPic } from './utilsHabits';


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
  
  const {t} = useTranslation();
  const getDefaultRegularityState: habitState = {
    regularity: getRegularityValues(habit.regularityInterval),
    doc: new Habit(),
    showDeleteWarrning: false
  }

  const [state, setState] = useState<habitState>({...getDefaultRegularityState, ...{doc: habit}});

  const handleChange = (e) => {
    const newDoc = {...state.doc, ...{[e.target.name]:e.detail.value}}
    const newState = {...state, ...{doc: newDoc}};
    setState(newState);
  }

  const handlerRegularityValue = (e) => {
    const newDoc = {...state.doc, ...{regularityIntervalGoal: e.detail.value}};
    setState({...state, ...{doc: newDoc}});
  }

  const handlerRegularityIntervalChange = (value) => {
    value = value || 'day';
    const newDoc = {...state.doc, ...{regularityInterval: value, regularityIntervalGoal: 1}};
    const newReg = {...state.regularity, ...getRegularityValues(value)};
    setState({...state, ...{doc:newDoc, regularity: newReg}});
  }

  const printRegularityLabel = () => {
    if(state.doc.regularityInterval === 'day'){
      return t('I will repeat this habit every day')
    }
    return t('I will repeat this habit') + ": " +
            state.doc.regularityIntervalGoal +
            t("habits.everyinterval." + state.doc.regularityInterval)           
  }

  const handleDifficultyChange = (e) => {
    const newDoc = {...state.doc, ...{difficulty: e.detail.value}};
    setState({...state, ...{doc: newDoc}});
  }

  const printDifficultyLabel = (hab: habitDifficulty): string => {
    switch(hab) {
      case habitDifficulty.trivial:
        return t("habits.difficulty.trivial");
      case habitDifficulty.easy:
        return t("habits.difficulty.easy");
      case habitDifficulty.medium:
        return t("habits.difficulty.medium");
      case habitDifficulty.hard:
        return t("habits.difficulty.hard");
      case habitDifficulty.extreme:
        return t("habits.difficulty.extreme");
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

  const selectSeed = (item:MarketItem):any => {
    const newDoc = {...state.doc, ...{plantName: item.name, seedItem: item, seedId: item.id}};
    setState({...state, ...{doc: newDoc}});
  }

  if(!state.doc.seedItem){
    selectSeed(gamifyService.getUserSeeds()[0]);
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
            <IonTitle>{t("Add Habit")}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonItem>
              <IonLabel position="floating">{t("Name")}</IonLabel>
              <IonInput 
                  name="name"
                  placeholder={t("habits.namePlaceholder")}
                  onIonChange={handleChange}
                  value={state.doc.name} />
          </IonItem>
          <IonItem>
              <IonLabel position="floating">{t('note')}</IonLabel>
              <IonTextarea 
                  placeholder={t("habits.notePlaceholder")}
                  name="note"
                  onIonChange={handleChange}
                  value={state.doc.note}></IonTextarea>
          </IonItem>

          <h3 style={{paddingLeft:'10px'}}>
            {t('habits.regularity')}
            <HelpTooltip top="5px" message={t('tooltips.habitRegularity')} />  
          </h3>

          <IonItem>
            <IonSegment value={state.doc.regularityInterval}
                        onIonChange={(e) => handlerRegularityIntervalChange(e.detail.value)}>
              <IonSegmentButton value="day">
                <IonLabel>{t("habits.intervalContinious.day")}</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="week">
                <IonLabel>{t("habits.intervalContinious.week")}</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="month">
                <IonLabel>{t("habits.intervalContinious.month")}</IonLabel>
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


          <h3 style={{paddingLeft:'10px'}}>
            {t('habits.difficultyTitle')}
            <HelpTooltip top="5px" message={t('tooltips.habitDifficultry')} />  
          </h3>

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


          {(!state.doc.id)? (
            <>
            <h3 style={{paddingLeft:'10px'}}>
              {t('plants.chooseSeed')}
              <HelpTooltip top="5px" message={t('tooltips.habitsSeed')} />  
            </h3>

            <IonItem>
              <IonLabel>{t('plants.chooseSeed')}</IonLabel>
            </IonItem>
            </>
          ) : (<></>)}

          {(!state.doc.id)? (
            <div>
              {gamifyService.getUserSeeds().map(item => {
                return  <IonButton  key={item.name} 
                                    fill={(item.name === state.doc.plantName)?'outline':'clear'} 
                                    onClick={() => selectSeed(item)}>
                            <IonIcon  class="seedSize" src={getPlantSeedPic(item)} />
                            <h3> {t("plants.names."+item.name)} ({item.quantity})</h3>
                        </IonButton>
              })}
            </div>
          ) : (<></>)}
          
              
        </IonContent> 

        <IonFooter>
          <IonToolbar>
            <IonTitle>
              <IonButton onClick={() => dismissFunc(state.doc, 'save')}>{t('save')}</IonButton>
              <IonButton onClick={() => dismissFunc(null, 'none')}>{t('cancel')}</IonButton>
            </IonTitle>
          </IonToolbar>
        </IonFooter>

        {(state.doc.id)?(
          <IonFab horizontal="end" vertical="bottom" >
            <IonFabButton size="small" color={COLOR_DANGER} onClick={() => showRemoveWarrning()}>
              <IonIcon size="large" icon={trash} />
            </IonFabButton>
          </IonFab>
        ) : (<></>)}
        
        <IonAlert
          isOpen={state.showDeleteWarrning}
          onDidDismiss={() => hideRemoveWarrning}
          header={t('warning')}
          message={t('deleteMessage')}
          buttons={[
            {
              text: t('cancel'),
              role: 'cancel',
              cssClass: 'secondary'
            },
            {
              text: t('deleteAccept'),
              handler: () => removehabit(),
              cssClass: 'warning'
            }
          ]}
        />
      </>
      );
  }

  return print();
};

export default HabitAddComponent;
