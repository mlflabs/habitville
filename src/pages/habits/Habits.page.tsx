import React, { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonList,
  IonTitle,
  IonToolbar,
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


export interface habitPageState {
  showModal: boolean,
  modalhabit: Habit
}



const HabitsPage: React.FC = () => {
  const [state, dataFunc] = useHabitsCollectionFacade(dataService.getDefaultProject());
  const [modalState, setModalState] = useState({showModal: false, modalhabit: new Habit()});
  console.log('0000000-----------------STATE::: ', state);
  const { habits, selected } = state;

  const addhabit = (habit:Habit = new Habit()) => {
    console.log('Add habit:  ', habit);
    setModalState({showModal: true, modalhabit: habit});
  }

  const hidehabitModal = () => {
    setModalState({showModal: false, modalhabit: new Habit()});
  }

  const habitDismissFunc = (habit: Habit|null, action:'save'|'remove'|'none') => {
    console.log('habit: ', habit)
    setModalState({showModal: false, modalhabit: new Habit()});
    if(action === 'save' && habit != null){
      dataFunc.save(habit);
    }
    else if(action === 'remove' && habit != null && habit._id){
      dataFunc.remove(habit._id);
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
                        key={habit._id} 
                        showEditModalFunction={addhabit}
              />
        ))}
      </IonList>
      {modalState.showModal? (
        <IonModal isOpen={modalState.showModal} onDidDismiss={() => hidehabitModal()}>
        <HabitAddComponent habit={modalState.modalhabit} 
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

