import React, {useState, useEffect} from "react";
import DateRangePicker from "react-bootstrap-daterangepicker";
import moment from "moment";


export default function DateTimeRangePicker({start, end, onChange = () => {}, label, customLabelWidth = "75px", disabled = false}) {
  const [currentStartValue, setCurrentStartValue] = useState();
  const [currentEndValue, setCurrentEndValue] = useState();
  const [valueLabel, setValueLabel] = useState("");

  useEffect(() => {
    if (start) {
      setCurrentStartValue(moment(start));
    }
  }, [start])

  useEffect(() => {
    if (end) {
      setCurrentEndValue(moment(end));
    }
  }, [end])

  useEffect(() => {
    if (currentStartValue && currentEndValue) {
      setValueLabel(`${currentStartValue.format("YYYY-MM-DD HH:mm:ss")} - ${currentEndValue.format("YYYY-MM-DD HH:mm:ss")}`)
    }
  }, [currentStartValue, currentEndValue])

  function updateValue(start, end) {
    setCurrentStartValue(start);
    setCurrentEndValue(end);
    onChange(start.format("YYYY-MM-DD HH:mm:ss"), end.format("YYYY-MM-DD HH:mm:ss"));
    return {start, end};
  }

  return (
    <div className="row">
      <label className="sr-only" htmlFor="inlineFormInputGroup">{label}</label>
      <div className="input-group mb-2">
        <div className="input-group-prepend">
          <div className="input-group-text" style={{width: customLabelWidth}}>{label}</div>
        </div>
        <DateRangePicker key={valueLabel}
          initialSettings={{
            autoUpdateInput: false,
            timePicker: true,
            timePicker24Hour: true,
            showDropdowns: true,
            startDate: currentStartValue,
            endDate: currentEndValue,
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
            }
          }}
          onCallback={(start, end, label) => {
            updateValue(start, end, label);
          }}
        >
          <input type="text" className="form-control" value={valueLabel} disabled={disabled}/>
        </DateRangePicker>
      </div>
    </div>
  )
}