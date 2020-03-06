import React, { useRef, useReducer, useEffect } from 'react';
import { Todo, TYPE_TODO, TodoList, getDefaultTodoList, TodoTag } from './models';
import {IonInput, IonButton, IonIcon} from '@ionic/react';
import { generateCollectionId } from '../../modules/data/utilsData';
import ulog from 'ulog'
import { waitMS } from '../../components/animatedIcon';
import { todoService } from './todo.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { COLOR_SECONDARY } from '../../colors';
import './todo.component.css';

const log = ulog('todo');



const TodoNewComp = ({list, tag, focus, closeFunc, saveFunc, projectId}:
  {list:TodoList|undefined, focus: boolean, 
    tag:string|undefined, closeFunc:Function,
    projectId: string, saveFunc: Function}) => {

  const reducer = (state, {type, payload}) => {
      switch(type) {
        case 'setTitle': 
          //see if we have a tag
          if(payload[payload.length -1] === '#'){
            return {...state, ...{title:payload, showTags: true}};
          }
          if(payload[payload.length -1] === ' ' && state.showTags === true){
            return {...state, ...{title:payload, showTags: false}};
          }
          return {...state, ...{title:payload}};
        case 'setFocus':
          return {...state, ...{focus:payload}};
        case 'setCloseFocus':
          console.log('setCloseFocus, ', payload);
          return {...state, ...{closeFocus:payload}};
        case 'setState':
          return payload;
        case 'setTags':
          return {...state, ...{tags: payload}};
        default:
          log.console.error('Incorrect action, ', type, payload);
          return state;
          
      }
  }
    
  
  
  
    const [state, _dispatch] = useReducer(reducer, {title:'', 
                                                  focus, 
                                                  tags: [],
                                                  showTags:false,
                                                  closeFocus: false})
  const inputEl = useRef(null);
  const searchTags$ = new Subject<string>();

  useEffect(() => {
    dispatch('setFocus', focus);
    if(focus){
      setDelayedFocusOnInput();
    }
  }, [focus])

  const setDelayedFocusOnInput = async () => {
    await waitMS(200);
    if(inputEl.current){
      console.log('Setting focus to input')
      // @ts-ignore: current is pointing to input
      inputEl.current.setFocus();
    }
  }


  const dispatch = (type: 'setTitle'|
                          'setFocus'|
                          'setTags'|
                          'setState'|
                          'setCloseFocus', payload:any = {}) => {
    _dispatch({type, payload});
  }

  //TODOS: testing....
  const setNewTitle = (e) => {
    dispatch('setTitle', e.detail.value);
    if(state.showTags) {
      const index = e.detail.value.lastIndexOf('#');
      searchTags$.next(e.detail.value.substring(index));
       
    }
  }


  const searchTags = async (value) => {
    console.log('tags searching, ', value);
    return await todoService.getTagsByStartingName(value);
    //use todo service to load tags here
  }

  searchTags$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    filter(value => value.length > 2),
    switchMap(term => searchTags(term.substring(1)))
  ).subscribe(res => {
    console.log('SEARCH TAGS:::::: ', res);
    dispatch('setTags', res);
  });



  const onKeyPress = (e) => {
    if(e.key === 'Enter'){
      save();
      dispatch('setTitle', '');
    }
  }

  const save = async () => {
    let fullname;
    if(!list){
      fullname = getDefaultTodoList('tasks', projectId).fullname;
    }
    else {
      fullname = list.fullname;
    }

     //do we have tags in the title
     const regex = /\#\w+\b/
     let tag2 = state.title.match(regex);
     let name = state.title;
     let otherTags = {};
     while(tag2) {
       console.log(tag2);
       otherTags[tag2[0].substring(1)] = '';
       name = name.substring(0, tag2.index) + name.substring(tag2.index+tag2[0].length).trim();
       console.log(name);
       tag2 = name.match(regex);
     }

     if(tag){
      otherTags[tag] = ''
    }
    
    const id = generateCollectionId(projectId, TYPE_TODO)
    const newDoc = new Todo({
      id, 
      name: name, 
      list: fullname,
      tags: Object.keys(otherTags),
      _new: true});

     await saveFunc(newDoc);
  };



  const onInputFocus = async(e) => {
    await waitMS(510);
    console.log('Focus', e);
    dispatch('setFocus', true);
  }

  const onInputBlur = (e) => {
    closeToolbar();
    dispatch('setCloseFocus', true);
    console.log('Blur ', state,  e);
  }

  const onSubAction = (type:string, payload:any = {}) => {
    switch(type) {
      case 'tag':
        dispatch('setState', {...state, ...{title: state.title+' #',  closeFocus: false}})
        break;
      case 'tagString':
        console.log(payload);
        const index = state.title.lastIndexOf('#');
        dispatch('setState', {...state, ...{
            title: state.title.substring(0, index+1) + payload + ' ',  
            closeFocus: false}})
        break;
      case 'addTag':
        dispatch('setState', {...state, ...{
          title: state.title.trim() + ' ' + payload + ' ',  
          closeFocus: false}})
        break;
      
    }
    
    dispatch('setCloseFocus', false);
    console.log('Action: ', type, inputEl)
    if(inputEl){
      console.log('Setting focus to input')
      // @ts-ignore: current is pointing to input
      inputEl.current.setFocus();
    }
      
  }

  const closeToolbar = async () => {
    //wait 1 sec, if nothing is presssed, then 
    await waitMS(500)
    console.log('CloseToolbar Focus: ', state);
    if(state.closeFocus)
      closeFunc()
    
     
  }


  const printSmallTagFromName = (tag:TodoTag) => {
    if(tag.icon) {
      return <IonIcon  
                key={tag.name}
                size="small" 
                color='success' 
                src={"/assets/icons/"+tag.icon} />
    }

    return <IonIcon  
                key={tag.name}
                size="small" 
                color='success' 
                src={"/assets/icons/tag.svg"} >
          {tag.name}  
          </IonIcon>
  }


  return (
    <>
    {state.showTags? (
      <div>
        {state.tags.map((tag:TodoTag) => (
          <IonButton 
            fill="clear"
            color={COLOR_SECONDARY}
            onClick={() => onSubAction('tagString', tag.name)}
            key={tag.name} >
            {printSmallTagFromName(tag)}
            {tag.name}
          </IonButton>

        ))}
      </div>
    ) : (<></>)}
    {state.focus? (
      <div>
        <IonButton class="newTodoCloseButton" onClick={() => closeToolbar()} fill="clear" >Close</IonButton>
        <IonButton onClick={() => onSubAction('tag')} fill="clear" >Tag #</IonButton>
        <IonButton onClick={() => onSubAction('addTag', '#today')} fill="clear" >
              <IonIcon  
                  key={'today'}
                  size="small" 
                  color='success' 
                  src={"/assets/icons/sun.svg"} />

        </IonButton>
        <IonButton onClick={() => onSubAction('addTag', '#important')} fill="clear" >
              <IonIcon  
                  key={'important'}
                  size="small" 
                  color='success' 
                  src={"/assets/icons/star.svg"} />

        </IonButton>
        <IonInput
            autofocus={true}
            ref={inputEl}
            className="new-todo"
            placeholder="What needs to be done?"
            onKeyPress={onKeyPress}
            onIonChange={setNewTitle}
            value={state.title}
            onIonBlur={onInputBlur}
            onIonFocus={onInputFocus}/>
      </div>
    ) : (<></>)}
    
    </>
  )


}

export default TodoNewComp;