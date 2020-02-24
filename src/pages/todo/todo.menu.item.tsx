import React, { useState } from 'react'
import { IonItem } from '@ionic/react'
import Lottie from 'react-lottie';
import sun from '../../icons/sun.json';
import './todo.menu.css';

export const waitMS = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const TodoMenuItemButtonComponet = ({name, color, actonFunc}:
  {name: string, color:string, actonFunc:Function}) => {
  
  const [state, setState] = useState({isStopped:true, isPaused:true})
  
  
  const defaultOptions = {
    loop: true,
    autoplay: true, 
    animationData: sun,
    rendererSettings: {
      clearCanvas: true,
      scaleMode: 'noScale',
      preserveAspectRatio: 'xMidYMid slice'
    }
  }; 
  
  const actionHandler = async() => {
    setState({isStopped:false, isPaused:false});
    actonFunc();

    await waitMS(1000);
    setState({isStopped:true, isPaused:true});
  }
  
  
  
  return (
    <IonItem  button 
        onClick={() => actionHandler()}
        color={color}  
        routerLink={encodeURI('/todos/tag/today')} 
        routerDirection="none"
        lines="none">
    <div className ="lottieicon">
      <Lottie  options={defaultOptions}
          height={25}
          width={25}
          isStopped={state.isPaused}
          isPaused={state.isStopped}/>
    </div>
    {name} 
</IonItem>
  )
}

export default TodoMenuItemButtonComponet