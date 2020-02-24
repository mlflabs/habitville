import React, { useReducer, useEffect } from 'react';
import ListAddInlineComponent from './list.inline.add.component';
import ulog from 'ulog';
import { TodoTag, TodoList, TYPE_TODO_LIST } from './models';
import { dataService } from '../../modules/data/dataService';
import { saveIntoArray } from '../../modules/data/utilsData';
import { authService } from '../../modules/auth/authService';
import { IonList, IonItem, IonLabel, IonItemDivider, IonItemGroup, IonItemSliding, IonItemOptions, IonItemOption, IonAlert, IonIcon } from '@ionic/react';
import { useLocation } from 'react-router';
import { todoService } from './todo.service';
import Lottie from 'react-lottie';
import sun from '../../icons/sun.json';
import TodoMenuItemButtonComponet from './todo.menu.item';

const log = ulog('todo');

const initialState:{
  tags:TodoTag[],
  tagsOpen: boolean
  lists:TodoList[],
  openLists: string[],
  showDeleteListAlert: boolean,
  deleteList: TodoList,
} = {
  tags:[],
  tagsOpen: false,
  lists:[],
  openLists:[],
  showDeleteListAlert: false,
  deleteList: new TodoList(),
}

const reducer =  (state = initialState, { type, payload }:{type:string, payload:any}) => {
  switch (type) {

    case 'hideDeleteAlert':
      return { ...state, ...{ showDeleteListAlert: false} }

    case 'showDeleteAlert': 
    return { ...state, ...{ showDeleteListAlert: true, deleteList: payload } }

    case 'setTodoList': 
      if(payload.deleted)
      return { ...state, ...{lists: state.lists.filter(l => l.id !== payload.id)} };
      else
        return { ...state, ...{lists: saveIntoArray(payload, state.lists)} };

    case 'setTodoLists':
      //find todos page
      return { ...state, ...{ lists: payload } };


    default:
      log.error('REDUCER GOT UNHANDLED TYPE ', type, payload);
      return state
  }
}


const TodoMenuListComponent = ({projectid}: {projectid:string}) => {
  const location = useLocation();
  const path = location.pathname;
  log.warn(path);
  const [state, _dispatch] = useReducer(reducer, initialState)

  const dispatch = (type: 'setTodoLists'|
                          'hideDeleteAlert'|
                          'showDeleteAlert'|
                          'setTodoList', payload = {}) => {
    _dispatch({type, payload});
  }


  useEffect(() => {
    const subTodoList = dataService.subscribeProjectCollectionChanges(
      projectid, TYPE_TODO_LIST ).subscribe(change => {
        log.info('Menu Change: ', change);
        dispatch('setTodoList', change);
      })
    loadInitTodoLists(projectid);
    return () => {
      subTodoList.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authService.userid])

  const loadInitTodoLists = async (projectid:string) => {
    const todolists = await dataService.getAllByProject(projectid,TYPE_TODO_LIST);
    log.info(todolists);
    dispatch('setTodoLists', todolists);
  }

  const deleteList = () => {
      todoService.deleteList(state.deleteList)
  }


  const tagButtonClickHandler = (tag) => {
    console.log(tag);
  }

  return (
    <IonList>
      {/*}
       <IonItem  button 
                color={(path ==='/todos/tag/today'? 'light' : '')}  
                routerLink={encodeURI('/todos/tag/today')} 
                routerDirection="none"
                lines="none">
       
              <IonIcon
                size="large"
                src="assets/icons/sun.svg"></IonIcon>
            Today
          </IonItem>
      */}
      <IonItemGroup key="listsGroup">
          <TodoMenuItemButtonComponet 
            name="Today"
            color={(path ==='/todos/tag/today'? 'light' : '')}  
            actonFunc = {() => tagButtonClickHandler('today')}
          /> 
            
             
        {state.lists.map( list => (
          <IonItemSliding key={list.name+'list'}>
            <IonItem  button 
                      color={(path ==='/todos/'+list.name? 'light' : '')}  
                      routerLink={encodeURI('/todos/'+list.name)} 
                      routerDirection="none"
                      lines="none">
              <IonLabel>{list.name}</IonLabel>
            </IonItem>
            <IonItemOptions side="end">
              <IonItemOption  color="danger" 
                              onClick={() => dispatch('showDeleteAlert',list)}>
                Delete</IonItemOption>
            </IonItemOptions>
          </IonItemSliding>
        ))}
      </IonItemGroup>
      <IonItemDivider>
      </IonItemDivider>
      <ListAddInlineComponent key="addNewItem" projectid={projectid} />

      <IonAlert 
        isOpen={state.showDeleteListAlert}
        onDidDismiss={() => dispatch('hideDeleteAlert')}
        header={"Are you sure you want to delete '" + state.deleteList.name + "' list?"}
        subHeader={'All tasks in this list will be deleted'}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => dispatch('hideDeleteAlert')
          },
          {
            text: 'Delete List',
            handler: () => deleteList()
          }
        ]}
      />
    </IonList>
  )



}

export default TodoMenuListComponent;