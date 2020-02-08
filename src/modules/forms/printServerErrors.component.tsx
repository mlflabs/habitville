import React, {  } from 'react';
import { IonNote } from '@ionic/react';

export const PrintServerErrors = (errors: Array<{msg: string, location: string}>) => {
  
  const getErrors = () => {
    return errors.map(m => (
      <IonNote color="danger">{m.msg}</IonNote>
    ))
  }
  
  return (
    <>
      { getErrors() }
    </>
  );
};