import React from 'react';
import { IonSlides, IonContent } from '@ionic/react';
import { Slide } from './Slide';
import { useHistory } from 'react-router-dom';

// Optional parameters to pass to the swiper instance. See http://idangero.us/swiper/api/ for valid options.
const slideOpts = {
  initialSlide: 1,
  //spaceBetween: 100,
  //speed: 40,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  pagination: {
    clickable: true,
  },
};

export const Tutorial1: React.FC = () => {

  const _slidesRef = React.createRef<any>();

  const history = useHistory();
  
  const nextSlide = () => {
    console.log('Next');
    _slidesRef.current.slideNext()
  }

  const prevSlide = () => {
    console.log('Prev');
    _slidesRef.current.slidePrev()
  }

  const onSlideFinish = () => {
    console.log('slide finished')
    history.push('/');
  }


  return <IonContent>
    <IonSlides 
      ref={_slidesRef}
      pager={true} 
      scrollbar={true} 
      onIonSlideReachEnd={onSlideFinish}
      options={slideOpts}>

      <Slide image="1.png" ></Slide>
      <Slide image="2.png"></Slide>
      <Slide image="3.png"></Slide>
      <Slide image="4.png"></Slide>
      <Slide image="5.png"></Slide>
      <Slide image="6.png"></Slide>
    </IonSlides>
    <div onClick={()=>prevSlide()} className="swiper-button-prev">

    </div>
    <div onClick={()=>nextSlide()} className="swiper-button-next"></div>
  </IonContent>
};

