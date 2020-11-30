import React, {useState} from "react";


export default function Input({value, onChange, label, type, customLabelWidth = "75px"}) {
  const [currentValue, setCurrentValue] = useState(value);

  function updateValue(value) {
    setCurrentValue(value);
    onChange(value);
  }

  return (
    <div className="row">
      <label className="sr-only" htmlFor="inlineFormInputGroup">{label}</label>
      <div className="input-group mb-2">
        <div className="input-group-prepend">
          <div className="input-group-text" style={{width: customLabelWidth}}>{label}</div>
        </div>
        <input type={type} className="form-control" value={currentValue} onChange={e => updateValue(e.target.value)} />
      </div>
    </div>
  )
}