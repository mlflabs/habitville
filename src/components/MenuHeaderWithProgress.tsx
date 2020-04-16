import React, {  } from 'react';
import { IonHeader } from '@ionic/react';
import { useTranslation } from 'react-i18next';





const MenuHeaderWithProgress = () => {

  const {t} = useTranslation();
  
  return (
    <IonHeader className="menuHeaderWithAvatar">
      <h1>{t('menu')}</h1>
    </IonHeader>
  )
}

export default MenuHeaderWithProgress;