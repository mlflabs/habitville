import i18n from 'i18next';
import { initReactI18next } from "react-i18next";
import Backend from 'i18next-xhr-backend';
//import LanguageDetector from 'i18next-browser-languagedetector';
import { Globalization } from '@ionic-native/globalization'
import { dataService } from './modules/data/dataService';



console.log();


i18n
  .use(initReactI18next) 
  .use(Backend)
  //.use(LanguageDetector)
  .init({
    interpolation: {  escapeValue: false },  // React already does escaping
    lng: 'en',   
    fallbackLng: 'en',                           // language to use
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    react: {
      wait: true,
      useSuspense: false,
    },
    debug: true,
    //defaultNS: 'common',
    //ns: ['common',],
    
    //debug: process.env.NODE_ENV !== 'production',
});


export const loadPreferedLanguage = async () => {
  //first
  //see if we have a settings doc
  let language;
  const doc = await dataService.getSettingsDoc();
  if(!doc || !doc.language){
    language = 'en';
    //language = await Globalization.getPreferredLanguage()
    console.log(language);
    
  }
  else {
    language = doc.language;
    console.log(doc) 
  }
  
  if(!language) return;
  console.log('Changing to language::: ', language);
  i18n.changeLanguage(language);
}

export default i18n;
