import axios from 'axios';
import { getNested } from '../../utils';
import { loadingService } from '../loading/loadingService';
import ulog from 'ulog';

const log = ulog('ajax');


export interface ajaxResponse {
  success: boolean,
  data: any,
  status?: number,
  errors?: errorMessage[]
}


export const getAjaxMessage = (success:boolean, data:any, 
    status:number = 0, errors: errorMessage[] = []): ajaxResponse => {
  return {success, data, status, errors}
}

export const getAjaxErrorMessage = (errorMessage: string, 
  location='system', status:number = 404 ) => {
    return getAjaxMessage(false, null, status, 
      [{location, msg:errorMessage}])
}

export interface errorMessage {
  location: string,
  msg: string
}

export interface postRequest {
  url: string,
  type: string,
  form: object,
  options?: object,
}

export interface getRequest {
  url: string,
  type: string,
  form: object,
  options?: object,
}

export const getPostRequest = (url:string, form:object, options:object = {}, ) => {
    return {url, type:'post', form, options};
}



export const getErrorMessage = (msg: string, location:string = "Server"):errorMessage => {
  return {msg, location};
}

export const post = async (req: postRequest, showLoading = true, loadingMessage="Loading..."):Promise<ajaxResponse> => {
  try {
    if(showLoading)
      loadingService.showLoading(loadingMessage);
    const res = await axios.post(req.url, req.form, req.options);

    loadingService.hideLoading();
    log.info(res);
    return getAjaxMessage(true, res.data, 200);
  }
  catch(err) {
    loadingService.hideLoading();
    const response = getNested(err, 'response');
    if(!response || !response.status) {
      return getAjaxMessage(false, null, 503, [getErrorMessage("Service is temporarly unavailable")]);
    }
    else if(response.status === 422){
      return getAjaxMessage(false, null, response.data.status, response.data.errors);
    }
    else if(response.status === 404) {
      return getAjaxMessage(false, null, 404, [getErrorMessage("Could not connect to server")]);
    }
    else {
      return getAjaxMessage(false, null, response.status, [getErrorMessage("Could not connect to server")]);
    }
  }
}
