import React, { useState, useReducer } from 'react';
import {
  IonPage,
  IonContent,
  IonList,
  IonFabButton,
  IonFab,
  IonIcon,
  IonModal} from '@ionic/react';

import { dataService } from '../../modules/data/dataService';
import { add } from '../../../node_modules/ionicons/icons';
import { useHabitsCollectionFacade } from './hooks/habits.hook';
import { Habit } from './models';
import HabitListItemComponent from './Habit.listitem.component';
import HabitAddComponent from './Habit.add.component';
import HeaderWithProgress from '../../components/HeaderWithProgress';
import { habitsService } from './habits.service';
import { DataFunctions } from '../todo/hooks/todos.hook';


export interface habitPageState {
  showModal: boolean,
  modalHabit: Habit|null,
}

const reducer = (state, action): habitPageState => {
  switch(action.type) {
    case 'showModal':
      return {...state, ...{showModal: action.data.showModal, modalHabit: action.data.habit} }
    case 'hideModal':
      return state;
    default:
      return state;
  }
}

export function getAction(todo:'showModal', data = {}){
  return {type:todo, data:data};
}


const HabitsPage: React.FC = () => {
  const [habitsState, dataFunc] = useHabitsCollectionFacade(dataService.getDefaultProject());
  const [state, dispatch] = useReducer(reducer, {
    showModal:false,
    modalHabit: null,
  })

  console.log('STATE::: ', state);
  const { habits } = habitsState;

  const addhabit = (habit:Habit = new Habit()) => {
    console.log('Add habit:  ', habit);
    dispatch(getAction('showModal', {showModal: true, habit}));
  }

  const hidehabitModal = () => {
    dispatch(getAction('showModal', {showModal: false, habit: null}));
  }

  const habitDismissFunc = (habit: Habit|null, action:'save'|'remove'|'none') => {
    console.log('habit: ', habit)
    dispatch(getAction('showModal', {showModal: false, habit: null}));
    if(action === 'save' && habit != null){
      habitsService.save(habit);
    }
    else if(action === 'remove' && habit != null && habit.id){
      habitsService.remove(habit.id);
    }
  }


  return (
    <IonPage>
      <HeaderWithProgress title="Habits" />
      <IonContent>
        
      <IonList>
        {habits.map(habit => (
              <HabitListItemComponent
                        habit={habit} 
                        dataFunctions={dataFunc}
                        key={habit.id} 
                        showEditModalFunction={addhabit}
              />
        ))}
      </IonList>
      {state.showModal? (
        <IonModal isOpen={state.showModal} onDidDismiss={() => hidehabitModal()}>
        <HabitAddComponent habit={state.modalHabit||new Habit()} 
                            dismissFunc = {habitDismissFunc}  />
        </IonModal>
      ) : (
        <></>
      )}
      

      <IonFab vertical="top" horizontal="end" slot="fixed" edge>
        <IonFabButton onClick={()=> addhabit()}>
          <IonIcon icon={add} />
        </IonFabButton>
      </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default HabitsPage;

