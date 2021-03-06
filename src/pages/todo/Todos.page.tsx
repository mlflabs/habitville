import React from 'react';
import {
  IonPage,
  IonContent,
  IonList,
  IonButton,
  IonToolbar,
  IonIcon,
  IonFab,
  IonFabButton,
  IonRefresher,
  IonRefresherContent} from '@ionic/react';
import { Plugins, KeyboardInfo } from '@capacitor/core';

import TodoNewComp from './todo.new.component';
import TodoListItemComp from './Todo.listitem.component';
import { useTodosCollectionFacade } from './hooks/todos.hook';
import './todos.page.css';
import HeaderWithProgress from '../../components/HeaderWithProgress';
import { useParams, useLocation } from 'react-router-dom';
import { capitalize } from '../../utils';
import { getDefaultProject } from '../../modules/data/utilsData';
import { authService } from '../../modules/auth/authService';
import ulog from 'ulog';
import { checkmarkCircleOutline, radioButtonOff, arrowDownOutline, arrowUpOutline, add } from 'ionicons/icons';
import { dataService } from '../../modules/data/dataService';
import { useTranslation } from 'react-i18next';
import { HelpTooltip } from '../../components/tooltip';

const log = ulog('todo');
const { Keyboard, Device } = Plugins;


const TodosPage  = () => {

  const project = getDefaultProject(authService.userid);
  const location = useLocation();
  
  const {t} = useTranslation();

  let list, tag;
  const params = useParams();
  log.info(params, location);
  if(location.pathname.startsWith('/todos/tag/')){
   tag = params['tag']
  }
  else {
    list = params['list']
  }

  const [state, dataFunc] = useTodosCollectionFacade(project.id, list, tag)
  const { docs, selectedTodo, tagDocs } = state;

  const printTitle = ():string => {
    console.log(state);
    if(state.list){
      let listname = state.list.name;
      if(listname === 'default')
        listname = t('todos.default')
      return t('todosTitle') + ': ' + capitalize(listname);
    }
    if(state.tag){
      let tagname = state.tag.name;
      if(tagname === 'today')
        tagname = t('todos.today');
      if(tagname === 'important')
        tagname = t('todos.important');
      return t('todosTitle') + ': ' + capitalize(tagname);
    }
    return t('todosTitle');
  }

  const setKeyboard = async () => {
    const devInfo = await Device.getInfo();
    if(devInfo.operatingSystem !== 'ios' &&
       devInfo.operatingSystem !== 'android') return;

    Keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
      console.log('keyboard will show with height', info.keyboardHeight);
    });
    
    Keyboard.addListener('keyboardDidShow', (info: KeyboardInfo) => {
      console.log('keyboard did show with height', info.keyboardHeight);
    });
    
    Keyboard.addListener('keyboardWillHide', () => {
      console.log('keyboard will hide');
    });
    
    Keyboard.addListener('keyboardDidHide', () => {
      console.log('keyboard did hide');
    });
  }


  setKeyboard();
  
  return (
    <IonPage>
      <HeaderWithProgress title={printTitle()} />
      <IonContent id="todoContent">
      <IonRefresher slot="fixed" onIonRefresh={(e) => dataService.refresh(e)}>
          <IonRefresherContent></IonRefresherContent>
      </IonRefresher>
        <div>
          <IonButton  color={(!state.doneTodos)? 'light':'success'} 
                      class="todoHeaderIcons" 
                      onClick={() => {dataFunc.changeDoneFilter(true)}}
                      fill="clear">
                      <IonIcon icon={checkmarkCircleOutline} />
          </IonButton>
          <IonButton  color={(state.doneTodos)? 'light':'success'} 
                      class="todoHeaderIcons" 
                      onClick={() => {dataFunc.changeDoneFilter(false)}}
                      fill="clear">
                      <IonIcon icon={radioButtonOff} />
          </IonButton>
          <IonButton  color={(state.orderFilter!== 'created')? 'light':'success'} 
                      class="todoHeaderButtons" 
                      onClick={() => {dataFunc.changeOrderFilter('created')}}
                      fill="clear">{t('date')}
                      {(state.orderFilter === 'created')? (
                        <IonIcon 
                          icon={((state.orderAsync === -1)? arrowDownOutline : arrowUpOutline)}/>
                      ) : (<></>) }
          </IonButton>
          <IonButton  color={(state.orderFilter !== 'name')? 'light':'success'} 
                      class="todoHeaderButtons" 
                      onClick={() => {dataFunc.changeOrderFilter('name')}}
                      fill="clear">{t('name')}
                      {(state.orderFilter === 'name')? (
                        <IonIcon 
                          icon={((state.orderAsync === -1)? arrowDownOutline : arrowUpOutline)}/>
                      ) : (<></>) }
          </IonButton>
          <HelpTooltip message={t('tooltips.todosSort')} fontSize="24px" />
        </div>
        <IonList>
            {docs.map(todo => (
              <TodoListItemComp   todo={todo} 
                                  tagDocs={tagDocs}
                                  lastChild = {false}
                                  selectedTodo={selectedTodo}                                 
                                  dataFunctions={dataFunc}
                                  key={todo.id} />
            ))}
        </IonList>
        <IonFab vertical="top" horizontal="end" slot="fixed" edge>
          <IonFabButton onClick={() => dataFunc.showNewTag(true)} >
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
      <IonToolbar>
          <TodoNewComp 
            list = {state.list}
            focus = {state.showNewTagFilter}
            closeFunc = {() => dataFunc.showNewTag(false)}
            tag = {tag}
            projectId={project.id||''} 
            saveFunc={dataFunc.save} />
      </IonToolbar>
    </IonPage>
  );
};

export default TodosPage;

