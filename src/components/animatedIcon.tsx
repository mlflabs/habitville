import React, { useState } from 'react'
import Lottie from 'react-lottie';
import './default.css'

export const waitMS = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};


function AnimatedIcon({iconsvg, actionFunc}:
    {iconsvg:any, actionFunc:Function}) {
  const [state, setState] = useState({isStopped:true, isPaused:true})


  const defaultOptions = {
    loop: true,
    autoplay: false, 
    render: 'svg',
    animationData: iconsvg,
    rendererSettings: {
      clearCanvas: true,
      scaleMode: 'noScale',
      preserveAspectRatio: 'xMidYMid slice'
    }
  }; 

  const actionHandler = async() => {
    setState({isStopped:false, isPaused:false});
    

    await waitMS(1000);
    actionFunc();
    setState({isStopped:true, isPaused:true});
  }

  return (
    <div onClick={() => actionHandler()} className ="animatedfunction">
      <Lottie  options={defaultOptions}
          height={25}
          width={25}
          isStopped={state.isPaused}
          isPaused={state.isStopped}/>
    </div>
  )
}

export default AnimatedIcon;
