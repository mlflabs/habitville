import React, { useState } from 'react';
import { IonList, IonModal, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonFab, IonFabButton, IonIcon, IonCardSubtitle, IonButton } from '@ionic/react';
import HabitListItemComponent from './Habit.listitem.component';
import { useHabitsCollectionFacade } from './hooks/habits.hook';
import { ProjectItem } from '../../modules/data/models';
import { Habit } from './models';
import { add } from '../../../node_modules/ionicons/icons';
import HabitAddComponent from './Habit.add.component';


export interface habitListState {
  showModal: boolean,
  modalhabit: Habit
}



const HabitListComponent = ({project}:{project: ProjectItem}) => {
  const [state, dataFunc] = useHabitsCollectionFacade(project);
  const [modalState, setModalState] = useState({showModal: false, modalhabit: new Habit()});

  const addhabit = (habit:Habit = new Habit()) => {
    setModalState({showModal: true, modalhabit: habit});
  }

  const hidehabitModal = () => {
    setModalState({showModal: false, modalhabit: new Habit()});
  }

  const addHabitDismissFunction = (habit: Habit|null, action:'save'|'remove'|'none') => {
    setModalState({showModal: false, modalhabit: new Habit()});
    if(action === 'save' && habit != null){
      console.log(habit);
      //dataFunc.save(habit);
    }
    else if(action === 'remove' && habit != null && habit.id){
      dataFunc.remove(habit.id);
    }
  }


  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Challenges

        <IonButton  color={'success'}
                    onClick={() => addhabit()}
                    fill="clear">Add New Challenge</IonButton>
        </IonCardTitle>
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
                              dismissFunc = {addHabitDismissFunction}  />
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