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
export const env = {...{
  APP_ID: 'hv',
  //myenvoy settings
  ACCESS_META_KEY: 'access',
  SERVER_ACCESS_META_KEY: 'ch',
  MOMENT_DATE_FORMAT: 'YYYYMMDD',

  //gamify 
  GAMIFY_HABIT_GOLD_BASE_REWARD:  5,
  GAMIFY_HABIT_EXPERIENCE_BASE_REWARD:  2,


  HABIT_REWARDS_GOLD_BASE: 5,
  HABIT_REWARDS_GOLD_PERCENTAGE_INCREASE: 0.2,
  HABIT_REWARDS_EXPERIENCE_BASE: 3,
  HABIT_REWARDS_EXPERIENCE_PERCENTAGE_INCREASE: 0.2,
  HABIT_REWARDS_NEW_GOLD: 5,
  HABIT_REWARDS_NEW_EXPERIENCE: 2,


  TODO_NEW_GOLD_REWARDS: 1,
  TODO_DONE_GOLD_REWARDS: 3,
  TODO_NEW_EXPERIENCE_REWARDS: 2,
  TODO_DONE_EXPERIENCE_REWARDS: 5,


  //messages
  MESSAGE_DURATION: 2000,

  //Auth
  TOKEN_EXPIRATION: 300, // how many days
  SYNC_SERVER: 'https://auth.mlflabs.com',
  AUTH_API_URL: 'https://auth.mlflabs.com',
  //SYNC_SERVER: 'http://localhost:3002',
  //AUTH_API_URL: 'http://localhost:3002',
}, ...detail}
