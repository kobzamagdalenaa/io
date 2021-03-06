import React, {useState, useEffect} from "react";


export default function Textarea({value, onChange = () => {}, label, customLabelWidth = "75px", disabled = false}) {
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value])

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
        <textarea disabled={disabled} className="form-control" value={currentValue} onChange={e => updateValue(e.target.value)}>
        </textarea>
      </div>
    </div>
  )
}