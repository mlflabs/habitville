import { useEffect, useReducer } from 'react';
import { Subscription } from 'rxjs';
import { Doc, ProjectItem } from '../models';
import { dataService } from '../dataService';
import { saveIntoArray } from '../../../utils';
import { filter } from 'rxjs/operators';


export interface DataState {
  selected: Doc|null,
  docs: Doc[]
}


export interface DataFunctions {
  save: {(doc: Doc):any},
  remove: {(id: string)},
  select: {(doc: Doc)},
}

const reducer = (state, action) => {
  switch(action.type){
    case 'select': 
    console.log('select: ', action)
      return {...state, ...{selected: action.doc } };

    case 'modify': 
      if(action.doc._deleted){
        return {...state, ...{docs: state.docs.filter(d => d._id !== action.doc._id)}};
      }
      else
        return {...state, ...{docs: saveIntoArray(action.doc, state.docs)}};
    case 'loadAll': 
      if(state.docs.length > 0)
        return state;
      return {...state, ...{docs: action.docs}};
    default:
      return state;
  }
}




//more simpler then auth hook, just read data
export function useDataCollectionFacade(project: ProjectItem, collection: string): [DataState, DataFunctions]{

  const [state, dispatch] = useReducer(reducer, {selected:null, docs:[]})

  const dao = {
    save: (doc: Doc) => dataService.saveInProject(doc, project, collection, null, null, true, true),
    remove: (id) => dataService.remove(id, true), //TODO: allow user to choose, sync or not to sync
    select: (doc: Doc) => dispatch({type:'select', doc: doc}),
  }

  useEffect(() => {
    const getCurrentDocs = async (dispatch) => {
      if(state.docs.length > 0) return;
      const docs = await dataService.getAllByProjectAndType(project._id, collection);
      dispatch({type: 'loadAll', docs: docs});    
    }
    getCurrentDocs(dispatch);
  }, [project._id, collection, state])

  useEffect(() => {
    const subscriptions: Subscription[] = [
      dataService.subscribeProjectCollectionChanges(project._id, collection, 0)
        .subscribe((doc) => {
            dispatch({type: 'modify', doc: doc});
        }),
    ];
    return () => { subscriptions.map(it => it.unsubscribe()) };
  },[project._id, collection]);


  return [state, dao];
}