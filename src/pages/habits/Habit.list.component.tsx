import React, { useState } from 'react';
import { IonList, IonModal, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonFab, IonFabButton, IonIcon } from '@ionic/react';
import HabitListItemComponent from './Habit.listitem.component';
import { useHabitsCollectionFacade } from './hooks/habits.hook';
import { ProjectItem } from '../../modules/data/models';
import { Habit } from './models';
import { add } from '../../../node_modules/ionicons/icons';
import HabitAddComponent from './Habit.add.component';


export interface habitPageState {
  showModal: boolean,
  modalhabit: Habit
}


const HabitListComponent = ({project}:{project: ProjectItem}) => {
  const [state, dataFunc] = useHabitsCollectionFacade(project);
  const [modalState, setModalState] = useState({showModal: false, modalhabit: new Habit()});

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
    else if(action === 'remove' && habit != null && habit.id){
      dataFunc.remove(habit.id);
    }
  }


  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Habits</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonList>
          {state.habits.map(habit => (
                <HabitListItemComponent
                          habit={habit} 
                          dataFunctions={dataFunc}
                          key={habit.id} 
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
      </IonCardContent>
      <IonFab vertical="top" horizontal="end" slot="fixed">
        <IonFabButton onClick={()=> addhabit()} size="small">
          <IonIcon icon={add} />
        </IonFabButton>
      </IonFab>
    </IonCard>
  )
}



export default HabitListComponent;