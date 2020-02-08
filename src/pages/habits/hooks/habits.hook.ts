import { useEffect, useState, useRef } from 'react';
import { Subscription } from 'rxjs';
import { Doc, ProjectItem } from '../../../modules/data/models';
import { Habit, habitStage } from '../models';
import { habitsState, getInitHabitsState,  HabitsService, habitsService } from '../habits.service';


export interface habitDataFunctions {
  save: {(doc: Habit)},
  remove: {(id: string)},
  select: {(doc: Habit)},
  changeStageFilter: {(stage: habitStage)}
}


//more simpler then auth hook, just read data
export function useHabitsCollectionFacade(project: ProjectItem): 
                                        [habitsState, habitDataFunctions]{

  const [state, setState] = useState(getInitHabitsState());

  const habitsService = useRef(new HabitsService());
  
          
  const dataFunctions = {
    save: (doc: Habit) => habitsService.current.save(doc),
    remove: (id) => habitsService.current.remove(id), //TODO: allow user to choose, sync or not to sync
    select: (doc: Habit) => habitsService.current.select(doc),
    changeStageFilter: (stage: habitStage) => habitsService.current.changeStageFilter(stage),
  }

  useEffect(() => {
    console.log('habitS HOOK - UseEffect NEW SERVICE------------------------------');
    habitsService.current.init(project)

    return habitsService.current.unsubscribe;
  }, [project._id])

  useEffect(() => {
    const subscriptions: Subscription[] = [
      habitsService.current.state$.subscribe(state => {
        console.log('habits Hook Sub: ', state);
        setState(state);
      })
    ];
    return () => { subscriptions.map(it => it.unsubscribe()) };
  },[project._id]);


  return [state, dataFunctions];
}