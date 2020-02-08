import { useState } from 'react';
import { home, timer, apps, sunny, star, heart, basket, construct, bonfire, checkmark, refresh } from 'ionicons/icons';



export interface AppPage {
  url: string;
  icon: any;
  title: string;
  subPages: AppPage[];
}


export interface MenuFunctions {

}

export interface MenuState {
  appPages: AppPage[];
}

export const todoTags: AppPage[] = [
  {
    title: 'Today',
    url: '/todos/today',
    icon: sunny,
    subPages: [],
  },
  {
    title: 'Important',
    url: '/todos/important',
    icon: star,
    subPages: []
  },
  {
    title: 'Important',
    url: '/todos/tasksmain33mmm',
    icon: checkmark,
    subPages: []
  },
  {
    title: 'Whish List',
    url: '/todos/whish',
    icon: heart,
    subPages: []
  },
  {
    title: 'Buy',
    url: '/todos/buy',
    icon: basket,
    subPages: []
  },
  {
    title: 'Projects',
    url: '/todos/projects',
    icon: construct,
    subPages: []
  },
]


export const getInitMenuState: MenuState = {
  appPages: [
    {
      title: 'Home',
      url: '/home',
      icon: home,
      subPages: []
    },
    {
      title: 'Habits',
      url: '/habits',
      icon: refresh,
      subPages: []
    },
    {
      title: 'Parties',
      url: '/parties',
      icon: bonfire,
      subPages: []
    },
    {
      title: 'Todos',
      url: '/todos',
      icon: apps,
      subPages: todoTags
    }
  ]
};


//more simpler then auth hook, just read data
export function useMenuHookFacade(): [MenuState, MenuFunctions] {

  const [state, setState] = useState(getInitMenuState);

          
  const menuFunctions: MenuFunctions = {
  }

  


  return [state, menuFunctions];
}