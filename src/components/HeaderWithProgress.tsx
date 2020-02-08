import React, { useState, useEffect } from 'react';
import { IonHeader, IonIcon, IonBadge } from '@ionic/react';
import { Line } from 'rc-progress';
import { gamifyService, getInitGamifyState, GamifyState } from '../modules/gamify/gamifyService';



import './header.css';
import 'rc-progress/assets/index.css';
import { heart, star, leaf, logoUsd } from 'ionicons/icons';

const HeaderWithProgress = ({title}:{title:string}) => {

  const [state, setState] = useState<GamifyState>(getInitGamifyState())

  const {health, maxHealth, experience, maxExperience, level, gold} = state;

  useEffect(() => {
    const sub = gamifyService.state$.subscribe(s => {
      setState({...state, ...s});
    })
    return () => {
      sub.unsubscribe();
    };
  }, [])


  return (
    <IonHeader className="headerWithAvatar">
      <div className="cityParent">
        <img src="/assets/pics/hills.svg" style={{right:'25px'}} className="headerHills" alt="Hills"/>
        <img src="/assets/pics/hills.svg" style={{right:'200px'}} className="headerHills" alt="Hills"/>
        <img src="/assets/pics/ground.svg" className="headerGround" alt="Ground"/>
        <img src="/assets/pics/sun.svg" style={{right:'130px', top: '10px', width:'5%'}} className="headerSkyDetail" alt="Hills"/>
        <img src="/assets/pics/cloud2.svg" style={{right:'240px', top: '40px'}} className="headerSkyDetail" alt="Hills"/>
        <img src="/assets/pics/cloud1.svg" style={{right:'60px', top: '40px'}} className="headerSkyDetail" alt="Hills"/>
        <img src="/assets/pics/cloud2.svg" style={{right:'140px', top: '15px'}} className="headerSkyDetail" alt="Hills"/>
      </div>
      <div className="statsParent" >
        <div className="statsBarParent" >
          <IonIcon class="statsBarIcon" icon={heart} style={{color: "#C20114"}} />
          <Line trailWidth={0} percent={health/maxHealth * 100} 
                className="statsBarLine"
                strokeWidth={4} strokeColor="#C20114" />
          <IonBadge class="statsBarBadge" 
                    color="danger" >{health}/{maxHealth}</IonBadge>
        </div>
        <div className="statsBarParent" >
        <IonIcon class="statsBarIcon" icon={leaf} style={{color: "#157F1F"}} />
          <Line trailWidth={0}  percent={experience/maxExperience * 100} 
                className="statsBarLine"
                strokeWidth={4} strokeColor="#157F1F" />
          <IonBadge class="statsBarBadge" 
                    color="success" >{experience}/{maxExperience}</IonBadge>
        </div>
        <div className="statsBarMoneyParent" >
          <IonBadge class="statsBarMoneyBadge" 
                    color="warning" >Gold: {gold}</IonBadge>
          <IonBadge class="statsBarMoneyBadge" 
                    color="success" >Level: {level}</IonBadge>
        </div>
      </div>
        
      <h1>{title}</h1>
    </IonHeader>
  )
}

export default HeaderWithProgress;