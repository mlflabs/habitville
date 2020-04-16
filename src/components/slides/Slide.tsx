import React from 'react';
import { IonSlides, IonSlide, IonContent, IonImg, IonLabel, IonGrid, IonRow, IonCol } from '@ionic/react';
import './slides.css'

export const Slide  = ({image}:{image:string}) => (
      <IonSlide>
         <IonImg src={'/assets/slides/'+image} alt=""  ></IonImg>
        
      </IonSlide>
);

