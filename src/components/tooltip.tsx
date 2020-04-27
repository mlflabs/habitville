import React, { useState } from 'react';
import { IonIcon, IonPopover } from '@ionic/react';
import { helpCircleOutline } from 'ionicons/icons';



const style = {
  fontSize:'32px', 
  position: 'relative',
  top: '10px'
}


export const  HelpTooltip = ({message, 
                             iconStyle = style,
                             fontSize = '32px',
                             top = '10px'}: 
    {message:string, iconStyle?:{}, fontSize?:string, top?:string}) => {
      
  const [state, setState] = useState<{show:boolean, e:any}>({show: false, e:{}});

  const show = (e) => {
    setState({show:true, e:e});
  }
  return (
    <>
    <IonPopover
        isOpen={state.show}
        event={state.e}
        onDidDismiss={e => setState({...state, ...{show:false} })}>
        <p style={{paddingLeft:'10px', paddingRight:'10px'}}>{message} </p>
    </IonPopover>
    <IonIcon  
      onClick={(e)=> setState({show: true, e: e.nativeEvent})}
      icon={helpCircleOutline} 
      style={ {...iconStyle, ...{fontSize, top} } } />
  </>
  )
}
