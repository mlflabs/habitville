import  ulog from 'ulog';
ulog.level = ulog.TRACE;

export const FIRST_DAY_OF_WEEK = 'Monday';



const dev = {
  
  
}

const prod = {
  SYNC_SERVER: 'https://auth.mlflabs.com',
  AUTH_API_URL: 'https://auth.mlflabs.com',
}
const detail = process.env.REACT_APP_STAGE === 'production' ? prod: dev;

console.log('*********************************: ', process.env.REACT_APP_STAGE)

export const env = {...{
  APP_ID: 'hv',
  //myenvoy settings
  ACCESS_META_KEY: 'access',
  

  //Auth
  TOKEN_EXPIRATION: 300, // how many days
  //SYNC_SERVER: 'https://auth.mlflabs.com',
  //AUTH_API_URL: 'https://auth.mlflabs.com',
  SYNC_SERVER: 'http://localhost:3002',
  AUTH_API_URL: 'http://localhost:3002',
}, ...detail}