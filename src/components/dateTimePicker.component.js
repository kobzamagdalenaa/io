import React, {useState, useEffect} from "react";
import DateRangePicker from "react-bootstrap-daterangepicker";
import moment from "moment";


export default function DateTimePicker({value, onChange = () => {}, label, customLabelWidth = "75px", disabled = false, minDate}) {
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value])

  function updateValue(value) {
    setCurrentValue(value);
    onChange(value);
    return value;
  }

  return (
    <div className="row">
      <label className="sr-only" htmlFor="inlineFormInputGroup">{label}</label>
      <div className="input-group mb-2">
        <div className="input-group-prepend">
          <div className="input-group-text" style={{width: customLabelWidth}}>{label}</div>
        </div>
        <DateRangePicker
          initialSettings={{
            singleDatePicker: true,
            timePicker: true,
            timePicker24Hour: true,
            showDropdowns: true,
            startDate: currentValue === undefined ? updateValue(moment().seconds(0).format("YYYY-MM-DD HH:mm:ss")) : currentValue,
            locale: {
              format: 'YYYY-MM-DD HH:mm:ss',
              separator: ' - ',
              'applyLabel': 'Wybierz',
              'cancelLabel': 'Anuluj',
              'fromLabel': 'Od',
              'toLabel': 'Do',
              'customRangeLabel': 'Niestandardowy',
              'weeksLabel': 'T',
              'daysOfWeek': ['Nd', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sb'],
              'monthNames': ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
              'firstDay': 1
            },
            minDate: minDate
          }}
          onCallback={(start) => {
            updateValue(start.format("YYYY-MM-DD HH:mm:ss"));
          }}
        >
          <input type="text" className="form-control" value={currentValue} disabled={disabled}/>
        </DateRangePicker>
      </div>
    </div>
  )
}