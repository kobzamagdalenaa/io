import React, {useEffect, useState} from 'react';
import * as _ from "lodash";
import accountService from "../services/account.service";
import departmentsService from "../services/departments.service";
import {Route, Switch, useParams, useRouteMatch} from "react-router-dom";
import AddOrEditPatient from "../patients/addOrEditPatient";
import {useHistory} from "react-router-dom";
import hospitalsService from "../services/hospitals.service";
import Timeline from 'react-calendar-timeline';
import moment from "moment";
import bedsService from "../services/beds.service";
import Beds from "./beds"
import Patients from "../patients/patients";
import occupationService from "../services/occupations.service";

export default function BedsManagement() {
  const {path, url} = useRouteMatch();

  return (
    <Switch>
      <Route exact path={path}>
        <DepartmentsList/>
      </Route>
      <Route path={`${path}/:departmentId/:hospitalId/:bedId/:dateRange`}>
        <Reservation/>
      </Route>
      <Route path={`${path}/:departmentId/:hospitalId`}>
        <Beds/>
      </Route>
      <Route path={`${path}/:departmentId`}>
        <HospitalsList/>
      </Route>
    </Switch>
  )
}

function Reservation() {
  const history = useHistory();
  const { path, url } = useRouteMatch();
  const { departmentId, hospitalId, bedId, dateRange } = useParams();

  return (
    <Patients/>
  )
}

function DepartmentsList() {
  const history = useHistory();
  const { path, url } = useRouteMatch();
  const [otherDepartments, setOtherDepartments] = useState([]);
  const [myDepartments, setMyDepartments] = useState([]);

  useEffect(() => {
    reloadDepartments();
  }, []);

  async function reloadDepartments() {
    const [allDepartments, myDepartments] = await Promise.all([
      departmentsService.loadAll(),
      departmentsService.loadForHospital(accountService.hospital.id)
    ]);

    setMyDepartments(myDepartments);
    setOtherDepartments(_.remove(allDepartments, $ => _.filter(myDepartments, $$ => $$.id === $.id).length === 0));
  }

  return (
    <div>
      <h2 className="text-center">Oddziały:</h2>
      <p className="text-center">Oddziały w Twoim szpitalu:</p>
      <div style={{display: "flex", flexWrap: "wrap"}}>
        {
          myDepartments.map(department => <DepartmentTile object={department} onClick={() => {history.push(`${url}/${department.id}`)}}/>)
        }
      </div>
      <p className="text-center">Oddziały innych szpitali:</p>
      <div style={{display: "flex", flexWrap: "wrap"}}>
        {
          otherDepartments.map(department => <DepartmentTile object={department} onClick={() => {history.push(`${url}/${department.id}`)}}/>)
        }
      </div>
    </div>
  )
}

function HospitalsList() {
  const history = useHistory();
  const { path, url } = useRouteMatch();
  const [department, setDepartment] = useState({});
  const [hospitals, setHospitals] = useState();
  const { departmentId } = useParams();

  useEffect(() => {
    reloadHospitals();
  }, []);

  async function reloadHospitals() {
    const department = await departmentsService.load(departmentId);
    setDepartment(department);
    const hospitals = await Promise.all(_.map(department.hospitals, $ => hospitalsService.load($)));
    setHospitals([..._.remove(hospitals, $ => $.id === accountService.hospital.id), ...hospitals]);
  }

  return (
    <div>
      <h2 className="text-center">Szpitale:</h2>
        {
          hospitals === undefined ? "" : (
            !hospitals.length ? <p className="text-center">Oddział nie istnieje w żadnym szpitalu.</p> :
              <div style={{display: "flex", flexWrap: "wrap"}}>
                {hospitals.map(hospital => <HospitalTile object={hospital} departmentId={departmentId} onClick={() => {history.push(`${url}/${hospital.id}`)}}/>)}
              </div>
          )
        }
    </div>
  )
}

function DepartmentTile({object, onClick}) {
  const [freeBeds, setFreeBeds] = useState();
  const [allBeds, setAllBeds] = useState();
  const [hospitals, setHospitals] = useState();

  useEffect(() => {
    loadHospitals();
  }, [object]);

  useEffect(() => {
    if (hospitals) {
      loadFreeBeds();
    }
  }, [hospitals]);

  async function loadHospitals() {
    const department = await departmentsService.load(object.id);
    const hospitals = await Promise.all(_.map(department.hospitals, $ => hospitalsService.load($)));
    setHospitals([..._.remove(hospitals, $ => $.id === accountService.hospital.id), ...hospitals]);
  }

  async function loadFreeBeds() {
    let freeBeds = 0;
    let allBeds = 0;
    for (let hospital of hospitals) {
      const hospitalId = hospital.id;
      const beds = await bedsService.loadAll(hospitalId, object.id);
      for (let bed of beds) {
        if (activeNow(bed)) {
          allBeds++;
          const occupations = await occupationService.loadForBed(hospitalId, object.id, bed.number);
          const colliding = occupations.filter($ => moment($.from).isSameOrBefore(moment()) && moment($.to).isSameOrAfter(moment()));
          if (colliding.length === 0) {
            freeBeds++;
          }
        }
      }
    }
    setAllBeds(allBeds);
    setFreeBeds(freeBeds);

    function activeNow(bed) {
      const activenessPeriods = _.chunk([bed.addedAt, ..._.flatMap(bed.removingPeriods, $ => [$.from, $.to]), bed.removedAt]
        .filter($ => $)
        .sort($ => $)
        .map($ => moment($)), 2)
        .map($ => ({from: $[0], to: $[1]}))
      return _.some(activenessPeriods, activePeriod =>
        activePeriod.from.isSameOrBefore(moment()) && (!activePeriod.to || activePeriod.to.isSameOrAfter(moment())))
    }
  }

  return (
    <div style={{margin: "10px", width: "240px", height: "200px", border: "1px solid lightgray", cursor: "pointer"}}
         onClick={onClick}>
      <h5 className="text-center" style={{margin: "60px 0 10px"}}>{object.name}</h5>
      { freeBeds === undefined ? null : <p className="text-center">Wolnych {freeBeds}/{allBeds}</p> }
      <p className="text-center">{object.extra}</p>
    </div>
  )
}

function HospitalTile({object, departmentId, onClick}) {
  const [freeBeds, setFreeBeds] = useState();
  const [allBeds, setAllBeds] = useState();

  useEffect(() => {
    if (departmentId) {
      loadFreeBeds();
    }
  }, [departmentId])

  async function loadFreeBeds() {
    const hospitalId = object.id;
    const beds = await bedsService.loadAll(hospitalId, departmentId);

    let freeBeds = 0;
    let allBeds = 0;
    for (let bed of beds) {
      if (activeNow(bed)) {
        allBeds++;
        const occupations = await occupationService.loadForBed(hospitalId, departmentId, bed.number);
        const colliding = occupations.filter($ => moment($.from).isSameOrBefore(moment()) && moment($.to).isSameOrAfter(moment()));
        if (colliding.length === 0) {
          freeBeds++;
        }
      }
    }
    setAllBeds(allBeds);
    setFreeBeds(freeBeds);

    function activeNow(bed) {
      const activenessPeriods = _.chunk([bed.addedAt, ..._.flatMap(bed.removingPeriods, $ => [$.from, $.to]), bed.removedAt]
        .filter($ => $)
        .sort($ => $)
        .map($ => moment($)), 2)
        .map($ => ({from: $[0], to: $[1]}))
      return _.some(activenessPeriods, activePeriod =>
        activePeriod.from.isSameOrBefore(moment()) && (!activePeriod.to || activePeriod.to.isSameOrAfter(moment())))
    }
  }

  return (
    <div style={{margin: "10px", width: "240px", height: "200px", border: "1px solid lightgray", cursor: "pointer"}}
         onClick={onClick}>
      <h5 className="text-center" style={{margin: "60px 0 10px"}}>{object.name}</h5>
      { freeBeds === undefined ? null : <p className="text-center">Wolnych {freeBeds}/{allBeds}</p> }
      <p className="text-center">{object.extra}</p>
    </div>
  )
}

/*

export default function BedsManagement() {
  const [managedDepartment, setManagedDepartment] = useState();
  const [departments, setDepartments] = useState([]);
  const [beds, setBeds] = useState([]);
  const [bedsOccupations, setBedsOccupations] = useState([]);

  useEffect(() => {
    reloadDepartments();
  }, []);

  async function reloadDepartments() {
    setDepartments(await departmentsService.loadForHospital(accountService.hospital.id));
  }

  return (
    <div className="w-100 px-3">
      <h2 className="text-center">{managedDepartment ? managedDepartment.name : "Oddziały:"}</h2>
      {
        managedDepartment ? (
          <div className="container" style={{maxWidth: "100%"}}>
            <DepartmentManagement department={managedDepartment} onBack={() => setManagedDepartment(undefined)}/>
          </div>
        ) : (
          <div style={{display: "flex", flexWrap: "wrap"}}>
            {
              departments.map(department => <DepartmentTile department={department} onClick={() => setManagedDepartment(_.assign({}, department))} />)
            }
          </div>
        )
      }
    </div>
  )
}

function DepartmentTile({department, onClick}) {

  return (
    <div style={{margin: "10px", width: "240px", height: "200px", border: "1px solid lightgray", cursor: "pointer"}}
         onClick={onClick}>
      <h5 className="text-center" style={{margin: "60px 0 10px"}}>{department.name}</h5>
      <p className="text-center">{department.extra}</p>
    </div>
  )
}

function DepartmentManagement({department, onBack}) {
  const [beds, setBeds] = useState([]);
  const [preprocessedData, setPreprocessedData] = useState([]);
  const [ganttChartData, setGanttChartData] = useState([]);
  const [period, setPeriod] = useState({
    from: moment().date(1),
    to: moment().endOf('month')
  });

  function createUnavailableChartData(id, hospital, department, from, to) {
    return {
      info: 'niedostępne',
      name: id.split("_")[1],
      hospital,
      department,
      fromDate: from,
      from: from ? ` od ${from}` : '',
      toDate: to,
      to: to ? ` do ${to}` : '',
      color: am4core.color({ r: 125, g: 125, b: 125 })
    }
  }

  function preprocess(beds) {
    const now = moment().format("YYYY-MM-DD HH:mm");
    return _.flatMap(beds, bed => {
      return [
        createUnavailableChartData(bed.id, bed.hospital, bed.department, undefined, bed.addedAt),
        bed.removedAt ? createUnavailableChartData(bed.id, bed.hospital, bed.department, bed.removedAt, undefined) : null,
        ..._.map(bed.removingPeriods, period => createUnavailableChartData(bed.id, bed.hospital, bed.departments, period.from, period.to))
      ].filter($ => !!$);
    });
  }

  // {
  //   name: "Sala 13, łóżko 15",
  //     fromDate: "2018-01-01 12:20",
  //   toDate: "2018-10-01 14:40",
  //   project: "Project A",
  //   color: colorSet.getIndex(0).brighten(0)
  // }

  async function reloadBeds() {
    setBeds(await bedsService.loadAll())
  }

  useEffect(() => {
    reloadBeds();
  }, [])

  useEffect(() => {
    const preprocessedBeds = preprocess(beds);
    setPreprocessedData(preprocessedBeds);
  }, [beds])

  useEffect(() => {
    function getMax(data) {
      return data.fromDate ? moment.max(moment(data.fromDate), period.from) : period.from;
    }

    function getMin(data) {
      return data.toDate ? moment.min(moment(data.toDate), period.to) : period.to;
    }

    if (!period) {
      setGanttChartData(preprocessedData);
    } else {
      setGanttChartData(_.chain(preprocessedData)
        .filter(data => getMax(data).isBefore(getMin(data)))
        .map(data => _.clone(data))
        .map(data => {
          data.fromDate = getMax(data).format("YYYY-MM-DD HH:mm");
          data.toDate = getMin(data).format("YYYY-MM-DD HH:mm");
          return data;
        }).value());
    }
  }, [preprocessedData, period])

  useEffect(() => {
    var chart = am4core.create("chartdiv", am4charts.XYChart);
    chart.language.locale = am4lang_pl_PL;
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

    chart.paddingRight = 30;
    chart.dateFormatter.inputDateFormat = "yyyy-MM-dd HH:mm";

    var colorSet = new am4core.ColorSet();
    colorSet.saturation = 0.4;

    console.log(ganttChartData);
    chart.data = ganttChartData;

    var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "name";
    categoryAxis.renderer.minGridDistance = 1;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.inversed = true;

    categoryAxis.renderer.labels.template.events.on("hit", (e) => {
      console.log(e.target.dataItem.category);
    });
    categoryAxis.renderer.labels.template.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    categoryAxis.renderer.labels.template.html = '<span>{name} <i class="fas fa-camera"></i></span>'

    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.dateFormatter.dateFormat = "yyyy-MM-dd HH:mm";
    dateAxis.renderer.minGridDistance = 70;
    dateAxis.strictMinMax = true;
    // dateAxis.renderer.tooltipLocation = 0;
    dateAxis.baseInterval = {
      "timeUnit": "minute",
      "count": 5
    };

    var series1 = chart.series.push(new am4charts.ColumnSeries());
    series1.columns.template.width = am4core.percent(80);
    series1.columns.template.tooltipText = "{info}{from}{to}";

    series1.dataFields.openDateX = "fromDate";
    series1.dataFields.dateX = "toDate";
    series1.dataFields.categoryY = "name";
    series1.columns.template.propertyFields.fill = "color"; // get color from data
    series1.columns.template.propertyFields.stroke = "color";
    series1.columns.template.strokeOpacity = 1;

    chart.scrollbarX = new am4core.Scrollbar();
    chart.scrollbarX.thumb.minWidth = 50;
    chart.scrollbarY = new am4core.Scrollbar();
    chart.scrollbarY.thumb.minHeight = 50;
  }, [ganttChartData])

  return (
    <div>
      <div>
        <DateRangePicker onCallback={(start, end) => setPeriod({from: moment(start).startOf('day'), to: moment(end).endOf('day')})}
          initialSettings={{
            locale: {
              format: 'YYYY-MM-DD',
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
            ranges: {
              "Dziś": [moment().toDate(), moment().toDate()],
              "Ten tydzień": [moment().day(1).toDate(), moment().day(7).toDate()],
              "Następny tydzień": [moment().day(1).add(1, 'week').toDate(), moment().day(7).add(1, 'week').toDate()],
              "Ten miesiąc": [moment().date(1).toDate(), moment().endOf('month').toDate()],
              "Następny miesiąc": [moment().startOf('month').add(1, 'month').toDate(), moment().startOf('month').add(1, 'month').endOf('month').toDate()],
            },
            startDate: period.from,
            endDate: period.to
          }}>
          <input type="text" className="form-control"/>
        </DateRangePicker>
      </div>
      <div id="chartdiv" style={{height: Math.min(ganttChartData.length*25, 700) + "px"}}></div>
      <div className="text-center mt-3">
        <button className="btn btn-light" style={{marginRight: "20px"}} onClick={() => onBack()}>Wróć</button>
      </div>
    </div>
  );
}


 */