import React, { useState, useEffect } from 'react';
import { IonItem, IonCard, IonCardHeader, IonCardTitle, IonIcon, IonFab, IonFabButton, IonCardContent, IonGrid, IonRow, IonCol, IonNote, IonBadge, IonLabel, IonAlert, IonModal } from '@ionic/react';
import { COLOR_LIGHT, COLOR_DARK, COLOR_SUCCESS, COLOR_DANGER, COLOR_SECONDARY, COLOR_PRIMARY, COLOR_MEDIUM, COLOR_WARNING } from '../../colors';
import { radioButtonOff, checkmarkCircleOutline, cog } from '../../../node_modules/ionicons/icons';
import moment from 'moment';
import { Habit, MOMENT_DATE_FORMAT, HabitAction } from './models';
import { habitDataFunctions } from './hooks/habits.hook';
import './Habit.listitem.component.css';
import { calculateCurrentStreak } from './utilsHabits';
import { gamifyService } from '../../modules/gamify/gamifyService';
import { toastService } from '../../modules/toast/toastService';
import { Line } from 'rc-progress';
import { HabitPlantComponent } from './habit.plant.component';



const HabitListItemComponent = ({habit, dataFunctions, showEditModalFunction}:
  {habit:Habit, dataFunctions: habitDataFunctions, showEditModalFunction:{(habit: Habit)}}) => {

  const [state, setState] = useState({
    doc: new Habit(habit),
    showPlantStats: false
  });

  useEffect(() => {
    setState({...state, ...{doc: new Habit(habit)} });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habit])


  const printDate = (index:number, active = false) => {
    const day =  moment().subtract(index, 'day');
    if(active)
    {
      return (
        <IonLabel
          color="primary"
        >
        {day.format('DD')} <br /> {day.format('dd')}
        </IonLabel>)
    }
    return (
      <>
      {day.format('DD')} <br /> {day.format('dd')}
      </>)
  }

  const printGoal = () => {
    if(state.doc.regularityInterval === 'day'){
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
          <strong> {state.doc.regularityIntervalGoal} times {state.doc.regularityInterval}</strong>
        </IonNote>
      </IonItem>
    )
  }




  const printDayIcon = (index: number, active=false) => {
    const day = moment().subtract(index, 'day');

    let action = state.doc.actions[day.format(MOMENT_DATE_FORMAT)];
    if(!action)
      action = {date: day.format(MOMENT_DATE_FORMAT), value: 0};

    console.log(action);
    if(active){
      return (<IonIcon  onClick={() => updatehabit({...action, ...{value: 1}})}
                      size="large" 
                      key={index}
                      color={ action.value > 0? COLOR_SUCCESS:  COLOR_DARK } 
                      icon={ action.value > 0? checkmarkCircleOutline : radioButtonOff } />)
    }
    // @ts-ignore: undefined, but we are forsing assignment just before this
    return (<IonIcon  
                      size="large" 
                      key={index}
                      color={ action.value > 0? COLOR_SUCCESS:  COLOR_DANGER } 
                      icon={ action.value > 0? checkmarkCircleOutline : radioButtonOff } />)

    
  }

  const updatehabit = (action: HabitAction) => {
    try {
      const {habit, rewards} = calculateCurrentStreak(state.doc, [action])
      gamifyService.addRewards(rewards);
      console.log(habit, rewards, action)
      dataFunctions.save(habit);
    }
    catch(e) {
      toastService.printSimpleError(e.message)
    }
  }

  const hidePlantModal = () => {
    setState({...state, ...{showPlantStats: false}});
  }
  const showPlantModal = () => {
    setState({...state, ...{showPlantStats: true}});
  }
  const plantModalDismissFunc = (habit: Habit|null, action:'save'|'remove'|'none') => {
    hidePlantModal();
    if(action === 'save' && habit != null){
      
    }
    else if(action === 'remove' && habit != null && habit.id){
      //dataFunc.remove(habit.id);
    }
  }

  const print = () => {
    return (
        <IonCard>
          <IonCardHeader>
            {/*<IonCardSubtitle>Card Subtitle</IonCardSubtitle>*/}
            <IonCardTitle>{state.doc.name}</IonCardTitle>
            <IonBadge class="habitBadge" color="success">{state.doc.currentStreak}</IonBadge>
            <IonBadge class="habitBadge" color="tertiary">{state.doc.biggestStreak}</IonBadge>
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
                <IonCol>{printDate(0, true)}</IonCol>
              </IonRow>
              <IonRow class="datecell">
                <IonCol>{printDayIcon(6)}</IonCol>
                <IonCol>{printDayIcon(5)}</IonCol>
                <IonCol>{printDayIcon(4)}</IonCol>
                <IonCol>{printDayIcon(3)}</IonCol>
                <IonCol>{printDayIcon(2)}</IonCol>
                <IonCol>{printDayIcon(1)}</IonCol>
                <IonCol>{printDayIcon(0, true)}</IonCol>
              </IonRow>
            </IonGrid>
          </IonItem>
          <IonCardContent>
            {printGoal()}
          </IonCardContent>
          <IonFab horizontal="end" vertical="bottom" edge>
            <IonFabButton size="small" color={COLOR_MEDIUM} onClick={() => showEditModalFunction(state.doc)}>
              <IonIcon size="large" icon={cog} />
            </IonFabButton>
          </IonFab>

          <IonFab horizontal="end" vertical="top" >
            <IonFabButton  
                onClick={() => showPlantModal()}
                color={COLOR_LIGHT}>
              <IonIcon 
                class="habitPlantIcon"
                src={'/assets/plants/' + state.doc.plantName+ '/' + state.doc.plantLevel + '.svg'}  />
              <Line trailWidth={0}  percent={(state.doc.plantExp/state.doc.plantNextLevelExp*100)} 
                className="plantProgressBar"
                strokeWidth={5} strokeColor="#157F1F" />
            </IonFabButton>
          </IonFab>

          <IonModal isOpen={state.showPlantStats} onDidDismiss={() => hidePlantModal()}>
            <HabitPlantComponent 
              doc={state.doc} 
              closeFunc = {plantModalDismissFunc}  />
          </IonModal>
        </IonCard>
        
    );
  }
  
  return print();
};

export default HabitListItemComponent;

