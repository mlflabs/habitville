import React, { useState, useEffect } from 'react';
import { IonItem, IonCard, IonCardHeader, IonCardTitle, IonIcon, IonFab, IonFabButton, IonCardContent, IonGrid, IonRow, IonCol, IonNote, IonBadge } from '@ionic/react';
import { COLOR_LIGHT, COLOR_DARK, COLOR_SUCCESS } from '../../colors';
import { radioButtonOff, checkmarkCircleOutline, cog } from '../../../node_modules/ionicons/icons';
import moment from 'moment';
import { Habit, MOMENT_DATE_FORMAT, HabitProgress } from './models';
import { habitDataFunctions } from './hooks/habits.hook';
import './Habit.listitem.component.css';
import { saveIntoArray, getIndexById } from '../../modules/data/utilsData';
import { calculateCurrentStreak } from './utilsHabits';
import { gamifyService } from '../../modules/gamify/gamifyService';



const HabitListItemComponent = ({habit, dataFunctions, showEditModalFunction}:
  {habit:Habit, dataFunctions: habitDataFunctions, showEditModalFunction:{(habit: Habit)}}) => {

  const [doc, setDoc] = useState(habit);

  useEffect(() => {
    setDoc(habit);
  }, [habit])


  const printDate = (index:number) => {
    const day =  moment().subtract(index, 'day');
    return (
      <>
      {day.format('DD')} <br /> {day.format('dd')}
      </>
    )
  }

  const printGoal = () => {
    if(doc.regularityInterval === 'day'){
      return (
        <IonItem>
              <IonNote>
                Remember, you promised that you will repeat 
                this habit <strong>every day</strong>.
              </IonNote>
        </IonItem>
      )
    }
    
    return (
      <IonItem>
        <IonNote>
          Remember you promised that you will repeat this habit 
          <strong> {doc.regularityValue} times {doc.regularityInterval}</strong>
        </IonNote>
      </IonItem>
    )
  }




  const printDayIcon = (index: number) => {
    const day = moment().subtract(index, 'day');
    let progress = doc.progress.find(obj => day.format(MOMENT_DATE_FORMAT) === obj.date);
    if(!progress)
      progress = {date: day.format(MOMENT_DATE_FORMAT), value: 0};

    // @ts-ignore: undefined, but we are forsing assignment just before this
    return (<IonIcon  onClick={() => updatehabit(index, progress)}
                      size="large" 
                      key={index}
                      color={ progress.value > 0? COLOR_SUCCESS:  COLOR_DARK} 
                      icon={progress.value > 0? checkmarkCircleOutline : radioButtonOff} />)
  }

  const updatehabit = (index: number, progress:{date:string, value:number}) => {
    console.log(' %%%%%%%%%%%%%%%%%%%%%%%%%%  Update Progress::: ', index, progress);
    let newProgress: HabitProgress = {date: progress.date, value: (progress.value === 0)? 1: 0 }

    const i = getIndexById(newProgress.date, doc.progress, 'date')
    if(i !== -1) {
      newProgress = {...doc.progress[i], ...newProgress }
    }
    const progresslist = saveIntoArray(newProgress, doc.progress, 'date');
    const newDoc = gamifyService.calculateHabitProgressRewards(
                    calculateCurrentStreak({...doc, ...{progress: progresslist}}), newProgress);
    console.log('NEW PROGRESSSSSSS:::::::::::::::::::::::;', newDoc);
    dataFunctions.save(newDoc);

  }

  const print = () => {
    return (
        <IonCard>
          <IonCardHeader>
            {/*<IonCardSubtitle>Card Subtitle</IonCardSubtitle>*/}
            <IonCardTitle>{doc.name}</IonCardTitle>
            <IonBadge class="habitBadge" color="success">{doc.currentStreak}</IonBadge>
            <IonBadge class="habitBadge" color="tertiary">{doc.bestStreak}</IonBadge>
          </IonCardHeader>
          <IonItem>
            <IonGrid>
              <IonRow class="datecell">
                <IonCol>{printDate(6)}</IonCol>
                <IonCol>{printDate(5)}</IonCol>
                <IonCol>{printDate(4)}</IonCol>
                <IonCol>{printDate(3)}</IonCol>
                <IonCol>{printDate(2)}</IonCol>
                <IonCol>{printDate(1)}</IonCol>
                <IonCol>{printDate(0)}</IonCol>
              </IonRow>
              <IonRow class="datecell">
                <IonCol>{printDayIcon(6)}</IonCol>
                <IonCol>{printDayIcon(5)}</IonCol>
                <IonCol>{printDayIcon(4)}</IonCol>
                <IonCol>{printDayIcon(3)}</IonCol>
                <IonCol>{printDayIcon(2)}</IonCol>
                <IonCol>{printDayIcon(1)}</IonCol>
                <IonCol>{printDayIcon(0)}</IonCol>
              </IonRow>
            </IonGrid>
          </IonItem>
          <IonCardContent>
            {printGoal()}
          </IonCardContent>
          <IonFab horizontal="end" vertical="bottom" edge>
            <IonFabButton size="small" color={COLOR_LIGHT} onClick={() => showEditModalFunction(doc)}>
              <IonIcon size="large" icon={cog} />
            </IonFabButton>
          </IonFab>
        </IonCard>
    );
  }
  
  return print();
};

export default HabitListItemComponent;

