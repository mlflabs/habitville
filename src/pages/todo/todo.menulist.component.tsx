import React, { useReducer, useEffect } from 'react';
import ListAddInlineComponent from './list.inline.add.component';
import ulog from 'ulog';
import { TodoTag, TodoList, TYPE_TODO_LIST, TYPE_TODO_TAG } from './models';
import { dataService } from '../../modules/data/dataService';
import { saveIntoArray } from '../../modules/data/utilsData';
import { authService } from '../../modules/auth/authService';
import { IonList, IonItem, IonLabel, IonItemDivider, IonItemGroup, IonItemSliding, IonItemOptions, IonItemOption, IonAlert, IonIcon } from '@ionic/react';
import { useLocation } from 'react-router';
import { todoService } from './todo.service';
import TodoMenuItemButtonComponet from './todo.menu.item';
import { list } from 'ionicons/icons';

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
    case 'setTags':
      return {...state, ...{tags: payload}};
    case 'setTag': 
      if(payload.deleted)
        return { ...state, ...{tags: state.tags.filter(t => t.id !== payload.id)} };
      else
        return { ...state, ...{tags: saveIntoArray(payload, state.tags)
                                    .sort((a,b) => (a.name > b.name)? 1 : -1)} };

    default:
      log.error('REDUCER GOT UNHANDLED TYPE ', type, payload);
      return state
  }
}


const TodoMenuListComponent = ({projectid}: {projectid:string}) => {
  const location = useLocation();
  const path = location.pathname;
  const [state, _dispatch] = useReducer(reducer, initialState)

  const dispatch = (type: 'setTodoLists'|
                          'setTags'|
                          'setTag'|
                          'hideDeleteAlert'|
                          'showDeleteAlert'|
                          'setTodoList', payload = {}) => {
    _dispatch({type, payload});
  }


  useEffect(() => {
    const subTodoList = dataService.subscribeProjectTypeChanges(
      projectid, TYPE_TODO_LIST ).subscribe(change => {
        log.info('Menu Change: ', change);
        dispatch('setTodoList', change);
      })
    loadInitTodoLists(projectid);
    const tagsList = dataService.subscribeByPropertyChange('type',
      'todoTag' ).subscribe(change => {
        log.info('Tags Changed: ', change);
         dispatch('setTag', change);
      })
    loadInitTags();
    return () => {
      subTodoList.unsubscribe();
      tagsList.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authService.userid])

  const loadInitTodoLists = async (projectid:string) => {
    const todolists = await dataService.getAllByProject(projectid,TYPE_TODO_LIST);
    log.info(todolists);
    dispatch('setTodoLists', todolists);
  }

  const loadInitTags = async () => {
    const tags = await dataService.queryByProperty('name', 'startsWith', '', TYPE_TODO_TAG);
    log.info(tags);
    dispatch('setTags', tags);
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
            icon="today"
            color={(path ==='/todos/tag/today'? 'light' : '')}  
            actonFunc = {() => tagButtonClickHandler('today')}
          /> 
          <TodoMenuItemButtonComponet 
            name="Important"
            icon="important"
            color={(path ==='/todos/tag/important'? 'light' : '')}  
            actonFunc = {() => tagButtonClickHandler('important')}
          /> 
            
          <IonItemGroup>
            <h2>Lists</h2>
          </IonItemGroup>    
        {state.lists.map( listItem => (
          <IonItemSliding key={listItem.name+'list'}>
            <IonItem  button 
                      color={(path ==='/todos/'+listItem.name? 'light' : '')}  
                      routerLink={encodeURI('/todos/'+listItem.name)} 
                      routerDirection="none"
                      lines="none">
              <IonLabel>
                      <IonIcon  
                        icon={list}/> 
                {' '+listItem.name}</IonLabel>
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

      <IonItemGroup>
        <h2>Tags</h2>
      </IonItemGroup>
      {state.tags.filter(tag => (tag.name !== 'today' && tag.name !== 'important'))
        .map( tagItem => (
          <IonItemSliding key={tagItem.name+'tag'}>
            <IonItem  button 
                      color={(path ==='/todos/tag/'+tagItem.name? 'light' : '')}  
                      routerLink={encodeURI('/todos/tag/'+tagItem.name)} 
                      routerDirection="none"
                      lines="none">
              <IonLabel>
                      <IonIcon  
                        src={"/assets/icons/tag.svg"} /> 
                {' '+tagItem.name}</IonLabel>
            </IonItem>
            <IonItemOptions side="end">
              <IonItemOption  color="danger" 
                              onClick={() => {console.log('No delete implemented')} }>
                Delete</IonItemOption>
            </IonItemOptions>
          </IonItemSliding>
        ))}

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