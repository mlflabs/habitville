import { post, getPostRequest } from '../ajax/ajax';
import { DIV } from './models';
import localStorageService from '../localStorage/localStorageService';

export interface SyncDataChannel {
  name: string,
  docs: any[],
}


export const organizeData = async (data: any[]) => {
  
  const channels = {};
  let channel;

  data.forEach(doc => {
    channel = doc.id.split(DIV)[0];
    console.log(doc);
    if(!channels[channel]) channels[channel] = [];
    channels[channel].push({...{}, ...doc});

  });
  //now load channel checkpoints
  const checkpoints = await localStorageService.getObject('channel_checkpoints') || {};
  return {channels: channels, checkpoints};
}

export const syncData = async (props:{  data:any[],
                                        syncurl: string, 
                                        token: string, 
                                        checkpoint: number,
                                        requestMaxSize:number}) => {
  //TODO: check our size of docs, if its bigger than max size
  console.log('Starting to server sync: ', props);
  try {
    //get checkpoint
    const data =  await organizeData(props.data);
    console.log('************************* ', data);
    const res = await post(getPostRequest(props.syncurl + '/sync/sync', {
      token: props.token,
      checkpoint: props.checkpoint,
      data,
    }));

    if(res) {
      //first save channel checkpoints
      const keys = Object.keys(res.data.checkpoints);
      //merge the 2 checkpoints
      const chpoints = await localStorageService.getObject('channel_checkpoints') || {};
      await localStorageService.setObject('channel_checkpoints',{...chpoints, ...res.data.checkpoints})

      return res.data.types;
    }
     
    return null;

  }
  catch(e){
    console.log(e);
   }
}

