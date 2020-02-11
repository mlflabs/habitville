
export const FIRST_DAY_OF_WEEK = 'Monday';

const dev = {
  COUCH_SERVER: 'http://localhost:3001/aaaaa',
  AUTH_API_URL: 'http://localhost:3002',
}

const prod = {


}
const detail = process.env.REACT_APP_STAGE === 'production' ? prod: dev;

export const env = {...{
  APP_ID: 'hv',
  //myenvoy settings
  ACCESS_META_KEY: 'access',
  

  //Auth
  TOKEN_EXPIRATION: 300, // how many days
  COUCH_SERVER: 'https://todo.mlflabs.com/api_todo',
  AUTH_API_URL: 'https://auth.mlflabs.com',
}, ...detail}