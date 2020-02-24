import React, { useReducer, useEffect } from 'react';
import { home, apps, sunny, star, heart, basket, construct, bonfire, checkmark, refresh } from 'ionicons/icons';
import { getDefaultProject } from '../../data/utilsData';
import { authService } from '../../auth/authService';
import ulog from 'ulog';
import TodoMenuListComponent from '../../../pages/todo/todo.menulist.component';

const log = ulog('menu');

export interface AppPage {
  url: string;
  icon: any;
  title: string;
  lastComponent?: any;
}


export interface MenuFunctions {

}

export interface MenuState {
  projectid: string,
  appPages: AppPage[];
}

export const todoTags: AppPage[] = [
  {
    title: 'Today',
    url: '/todos/today',
    icon: sunny,
  },
  {
    title: 'Important',
    url: '/todos/important',
    icon: star,
  },
  {
    title: 'Important',
    url: '/todos/tasksmain33mmm',
    icon: checkmark,
  },
  {
    title: 'Whish List',
    url: '/todos/whish',
    icon: heart,
  },
  {
    title: 'Buy',
    url: '/todos/buy',
    icon: basket,
  },
  {
    title: 'Projects',
    url: '/todos/projects',
    icon: construct,
  },
]

export const getMenuState = (projectid: string): MenuState => {
  return {
    projectid,
    appPages: [
      {
        title: 'Home',
        url: '/home',
        icon: home,
      },
      {
        title: 'Habits',
        url: '/habits',
        icon: refresh,
      },
      {
        title: 'Parties',
        url: '/parties',
        icon: bonfire,
      },
      {
        title: 'Todos',
        url: '/todos',
        icon: apps,
        lastComponent: <TodoMenuListComponent projectid={projectid}  />
      }
    ]
  }
};


const reducer = (state, { type, payload }:{type:string, payload:any}):MenuState => {
  switch (type) {
  case 'authChange':
    return getMenuState(getDefaultProject(authService.userid).id);
  default:
    log.error('REDUCER GOT UNHANDLED TYPE ', type, payload);
    return state
  }
}



//more simpler then auth hook, just read data
export function useMenuHookFacade(): [MenuState, MenuFunctions] {
  const project = getDefaultProject(authService.userid);
  const [state, _dispatch] = useReducer(reducer, getMenuState(project.id))

  useEffect(() => {
    const sub = authService.username$.subscribe(name => {
      _dispatch({type: 'authChange', payload: authService.userid});
    })
   
    return () => {sub.unsubscribe()};
  }, [])
          
  const menuFunctions: MenuFunctions = {
  }

  


  return [state, menuFunctions];
}