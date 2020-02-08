import React, { useEffect, useState } from 'react'



const MyInput = (props) => {



  const [value, setValue] = useState(props.value || ''); 

  /*
  useEffect(() => {
    props.attachToForm({name:props.name, value: props.value});

    return props.detachFromForm({name:props.name, value:props.value});
  },[props]);
*/

  const handleEmailChange = (event) => {
    setValue(event.target.value);
  };


  return (
    <input  type="text" 
            name={props.name} 
            onChange={handleEmailChange} 
            value={props.value}/>
  )
}

export default MyInput;