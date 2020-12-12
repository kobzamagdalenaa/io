import React, {useState, useEffect} from "react";


export default function Radio({values, selected, onChange, name, label, customLabelWidth = "75px"}) {
    const [currentValue, setCurrentValue] = useState(undefined);

    useEffect(() => {
        setCurrentValue(selected);
    }, [selected])

    function updateValue(e) {
        const value = e.currentTarget.value;
        setCurrentValue(value);
        onChange(value);
    }

    return (
        <div className="row">
            <label className="sr-only" htmlFor="inlineFormInputGroup">{label}</label>
            <div className="input-group mb-2 w-100 d-flex">
                <div className="input-group-prepend">
                    <div className="input-group-text" style={{width: customLabelWidth}}>{label}</div>
                </div>
                <div className="d-flex flex-grow-1">
                    {
                        values.map(v => (
                            <div className="form-check form-check-inline flex-grow-1" style={{padding: "0 0 0 16px"}}>
                                <input className="form-check-input" type="radio" checked={currentValue===v} id={`${name}_${v}`} name={name} value={v} onChange={updateValue} />
                                <label className="form-check-label" for={`${name}_${v}`}>{v}</label>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}