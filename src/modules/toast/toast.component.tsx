import React, { useState, useEffect } from 'react';
import { Subscription } from 'rxjs';
import { toastService, ToastMessage } from './toastService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Toasts: React.FC = () => {
  const [message, setMessage] = useState<ToastMessage | null>(null);

  useEffect(() => {
    const subscriptions: Subscription[] = [
      toastService.messages$.subscribe((m: ToastMessage) =>{
        setMessage(m);
      })
    ];
    return () => { subscriptions.map(it => it.unsubscribe()) };
  },[message]);

  return (
    <div className='toastDiv' >
      <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          draggable
          pauseOnHover
          />
    </div>
  );
};