import React, {useState, useEffect} from "react";


export default function Search({placeholder, onChange}) {
  const [currentValue, setCurrentValue] = useState("");

  function updateValue(value) {
    setCurrentValue(value);
    onChange(value);
  }

  return (
    <div className="row">
      <div className="input-group">
        <input type="text" className="form-control" value={currentValue} onChange={e => updateValue(e.target.value)} placeholder={placeholder} />
      </div>
    </div>
  )
}