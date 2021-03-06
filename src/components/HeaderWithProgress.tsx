import React, { useState, useEffect } from 'react';
import { IonHeader, IonIcon, IonBadge } from '@ionic/react';
import { Line } from 'rc-progress';
import { gamifyService, getInitGamifyState, GamifyState } from '../modules/gamify/gamifyService';



import './header.css';
import 'rc-progress/assets/index.css';
import { heart, leaf } from 'ionicons/icons';
import { useHabitsCollectionFacade } from '../pages/habits/hooks/habits.hook';
import { getDefaultProject } from '../modules/data/utilsData';
import { authService } from '../modules/auth/authService';
import { Habit } from '../pages/habits/models';
import { getPlantPic, getLandscapePlantPic } from '../pages/habits/utilsHabits';

const HeaderWithProgress = ({title, showDetail = true}:{title:string, showDetail?:boolean}) => {

  const [state, setState] = useState<GamifyState>(getInitGamifyState())
  const [habitsState] = useHabitsCollectionFacade(getDefaultProject(authService.userid));
  
  const {experience, maxExperience, level, gold} = state;

  const landscape = Object.assign(state.landscape || {});
  if(!landscape.trees) {
    landscape.trees = [];
  }

  console.warn(landscape);


  useEffect(() => {
    const sub = gamifyService.state$.subscribe(s => {
      setState({...state, ...s});

    })
    return () => {
      sub.unsubscribe();
    };
  }, [])

  const positionArray = [300, 200, 100, 150, 250, 50, 
      350, 375, 25, 75, 125, 175, 225, 275, 325, 375]

  console.log(habitsState);

  const getPlantSize = (level: number): string => {
    if(level < 3) return '5px'
    if(level < 4) return '50px'
    if(level < 6) return '60px';
    if(level < 8) return '70px';

    return '100px';
  }

  const getPlantTop = (level:number): string => {
    if(level < 3) return '4px'
    return '9px';
  }

  return (
    /*
        400
        300，200，100，150，250，50，350，375，25，75，125，175，225，275，325，375
        400/num
        380/num
    */
    <IonHeader className="headerWithAvatar">
      <div className="cityParent">
        <img src="/assets/pics/hills.svg" style={{right:'25px'}} className="headerHills" alt="Hills"/>
        <img src="/assets/pics/hills.svg" style={{right:'200px'}} className="headerHills" alt="Hills"/>
        <img src="/assets/pics/ground.svg" className="headerGround" alt="Ground"/>
        <img src="/assets/pics/sun.svg" style={{right:'130px', top: '10px', width:'5%'}} className="headerSkyDetail" alt="Hills"/>
        <img src="/assets/pics/cloud2.svg" style={{right:'240px', top: '40px'}} className="headerSkyDetail" alt="Hills"/>
        <img src="/assets/pics/cloud1.svg" style={{right:'60px', top: '40px'}} className="headerSkyDetail" alt="Hills"/>
        <img src="/assets/pics/cloud2.svg" style={{right:'140px', top: '15px'}} className="headerSkyDetail" alt="Hills"/>

        {landscape.trees.map(tree => (
          <img  src={getLandscapePlantPic(tree)}
                key={tree.habitId}
                style={{left: tree.position +'px', bottom: getPlantTop(tree.level), width: getPlantSize(tree.level)}} 
                className="habitPlant" alt="Tree"/>
        ))}

      </div>
      {(showDetail? (
        <div className="statsParent" >
            <div className="statsBarParent" >
      
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
      ) : (<></>))}
      
      <h1>{title}</h1>
    </IonHeader>
  )
}

export default HeaderWithProgress;