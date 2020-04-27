import React from 'react';
import { IonHeader} from '@ionic/react';


import '../../../components/header.css';
import { Landscape } from '../../gamify/models';

const LandscapeComp = ({username, landscape}:{username:string, landscape:Landscape}) => {

  

  const getTreeSize = (level: number): string => {
    if(level < 3) return '5px'
    if(level < 4) return '50px'
    if(level < 6) return '60px';
    if(level < 8) return '70px';

    return '100px';
  }

  const getTreeTop = (level:number): string => {
    if(level < 3) return '4px'
    return '10px';
  }

  return (
    
    <IonHeader className="headerWithAvatarLandscapeEdition">
      <div className="cityParentLandscapeEdition">
        <img src="/assets/pics/hills.svg" style={{right:'25px'}} className="headerHills" alt="Hills"/>
        <img src="/assets/pics/hills.svg" style={{right:'200px'}} className="headerHills" alt="Hills"/>
        <img src="/assets/pics/ground.svg" className="headerGround" alt="Ground"/>
        
        {landscape.trees.map(tree => (
          <img  src={'/assets/plants/' + tree.id+ '/' + tree.level + '.svg'}
                key={tree.habitId}
                style={{left: tree.position +'px', bottom: getTreeTop(tree.level), width: getTreeSize(tree.level)}} 
                className="habitPlant" alt="Tree"/>
        ))}

      </div>
      <h1>{username}</h1>
    </IonHeader>
  )
}

export default LandscapeComp;