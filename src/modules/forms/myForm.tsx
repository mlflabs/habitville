import React, { useEffect, useState } from 'react'
import MyInput from './myInput';
import { saveIntoArray, findById } from '../../utils';
import { IonButton } from '@ionic/react';
import validator from 'validator';


// use to generate form, usually from outside form passed into here
// so far we can use, ones that have stars have been tested
// "text", "password", "email", "number", "search", "tel", and "url"
export interface FormItem { 
  id: string;
  displayName?: string;
  type: string;
  messages?: string[];
  validators?: any[];  
  default?: any;
}

export interface ValidatorItem {
  type: string;
  message?: string|null;
  options?: any;
}


// use to hold form state
export interface FormValueItem {
  id: string;
  displayName: string;
  type: string;
  value: string;
  messages: string[];
  errors: string[];
  dirty: boolean;
  hasValidation:boolean;
  //status: number; //0: untouched, 1: valid, 2: not valid
}

export interface OptionsItem {
  submitButtonText: string;
}

export const defaultOptions:OptionsItem = {
  submitButtonText: "Submit",
}

export const getFormOptions = (settings:{}) => {
  return {...defaultOptions, ...settings};
}

export interface Props {
  items: FormItem[],
  submitFunction: Function,
  options?: OptionsItem
}

export interface State {
  items: FormValueItem[],
  valid: boolean
}

export function getValidator(type:string, options:any = null, message:string|null = null):ValidatorItem {
  return {type, options, message};
}



const MyForm = (props:Props) => {
  const submitFunction = props.submitFunction;
  const options = props.options|| defaultOptions;

  const [state, setState] = useState<State>({items:[], valid:false});

  useEffect(() => {
    initForm(props.items);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[props.items]);


  const initForm = (items) => {
    let model: FormValueItem[] = [];
    // go thourgh props and generate our model from schema;
    if(items) { //no schema, do nothing
      items.forEach((item:FormItem) => {
        let messages = item.messages;
        
        console.log(typeof(messages));
        if(typeof(messages) === 'string'){
          console.log('Messages is string');
        }
        else if(Array.isArray(messages)){
          console.log('messages array');
        }
        else {
          messages = [];
        }

        model.push(validateItem({
            id: item.id,
            displayName: item.displayName || item.id, 
            type: item.type,
            value: item.default||'', 
            messages,
            errors: [],
            dirty:false,
            hasValidation: (Array.isArray(item.validators) && item.validators.length>0)
        }));
      });
      setState({items: model, valid: validateForm(model)});
      //console.log(state);
    }
  }

  //const updateItem = (id:string, displayName: string, type: string, value:any, messages:string[], hasValidation:boolean, touched:boolean) => {
  const updateItem = (item:FormValueItem) => {
    //console.log('Update Item, ', item);
    const items = saveIntoArray(validateItem(item), state.items, 'id')
    setState({
      items: items,
      valid: validateForm(items)
    });
  }



  const validateItem = (item:FormValueItem): FormValueItem => {
    const errors: string[] = validate(item.id, item.value);
    //console.log(item)
    return {...item, ...{errors}}
  }

  const validate = (id:string, value:any): string[] => {
    //console.log(typeof(value));

    if(typeof(value) !== 'string') return [];
    
    const item:FormItem = findById(id, props.items, 'id');
    if(!item.validators)
      item.validators = [];

    const messages: string[] = [];
    item.validators.forEach((val:ValidatorItem) => {
      if(val.type === 'isEmpty') {
        if(validator.isEmpty(value)){
          messages.push(val.message || 'Value cannot be empty')
        }
      }
      if(val.type === 'isLength'){
        if(!validator.isLength(value, val.options)){
          messages.push(val.message || 'Value length is not valid');
        }
      }
      if(val.type === 'isEmail'){
        if(!validator.isEmail(value, val.options)){
          messages.push(val.message || 'Valid Email required');
        }
      }
    });

    //lastly check the whole form

    //if(messages.length === 0)
    //  validateForm();

    return messages;
  }


  const submit = () => {
    const form = {};
    state.items.forEach(item => {
      form[item.id] = { value: item.value };
    });
    submitFunction(form);
    console.log(state);
  }

  const validateForm = (items = state.items) => {
    let errors = 0;
    items.forEach(item => {
      errors += item.errors.length;
    });

    return errors === 0;
  }
  

  return (
    <div>
        { Object.values(state.items).map((i) => (
          <MyInput key={i.id} data={i} updateFunction={updateItem} />
        ))}
          <IonButton  
            key={'submitButton'}
            onClick={submit} 
            disabled={!state.valid}
            color="primary">{options.submitButtonText}</IonButton>
    </div>
  )

};

export default MyForm;



/*
  const attachToForm = (component) => {
    setInputs({...inputs, ...{[component.props.name]: component}});
    setModel({...model, ...{[component.props.name]: component.state.value}});
  };

  const detachFromForm = (component) => {
    const i = Object.assign({}, inputs);
    delete i[component.props.name]
    setInputs(i);

    const m = Object.assign({}, model);
    delete m[component.props.name];
    setModel(m);
  }

  const updateModel = () => {
    const m = Object.assign({}, model);
    Object.keys(inputs).forEach((name) => {
      m[name] = inputs[name].state.value;
    });

    setModel(m);
  }

  const submit = (event) => {
    event.preventDefault();
    updateModel();
    console.log(model);
  }

  const getElement = (type) => {
    if(type === 'string'){
      return (
        <div>type</div>
      )
    }
  }
*/