import React, {useEffect, useState} from 'react';
import {useHistory, useParams, useRouteMatch} from "react-router-dom";
import bedsService from "../services/beds.service";
import * as _ from "lodash";
import moment from "moment";
import Timeline from "react-calendar-timeline";
import Input from "../components/input.component";
import DateTimeRangePicker from "../components/dateTimeRangePicker.component";
import occupationService from "../services/occupations.service";

export default function Beds() {
  const history = useHistory();
  const { path, url } = useRouteMatch();
  const { departmentId, hospitalId } = useParams();
  const [beds, setBeds] = useState([]);
  const [removings, setRemovings] = useState([]);
  const [occupations, setOccupations] = useState([]);
  const [allOccupations, setAllOccupations] = useState([]);
  const [customOccupation, setCustomOccupation] = useState({});

  useEffect(() => {
    loadOccuptaions();
    loadBeds();
  }, []);

  useEffect(() => {
    setAllOccupations([...occupations, ...removings, customOccupation].filter($ => $.start_time));
  }, [occupations, removings, customOccupation])

  async function loadBeds() {
    const allBeds = await bedsService.loadAll(hospitalId, departmentId);

    setBeds(_.map(allBeds, $ => ({id: $.id.split("_")[1], title: $.id.split("_")[1]})));
    setRemovings(preprocess(allBeds));
  }

  async function loadOccuptaions() {
    const occupations = await occupationService.loadAll(hospitalId, departmentId);

    setOccupations(occupations.map(occupation => ({
      id: occupation.id,
      group: occupation.bedId,
      start_time: moment(occupation.from),
      end_time: moment(occupation.to),
      title: "Pacjent",
      canMove: false,
      canResize: false,
      canChangeGroup: false,
      selectedBgColor: 'rgba(255,213,17,0.7)',
      bgColor: 'rgb(255,212,16)'
    })))
  }

  function updateOccupationFromChart(startTime, groupId) {
    setCustomOccupation({
      id: "custom",
      group: groupId ? groupId : customOccupation.group,
      start_time: moment(startTime),
      end_time: customOccupation.end_time ?
        moment(startTime).add(moment.duration(customOccupation.end_time.diff(customOccupation.start_time))) :
        moment(startTime).add(4, "days"),
      selectedBgColor: 'rgba(0,255,125,0.7)',
      bgColor: 'rgba(0,255,123,0.7)'
    })
  }

  function extendOccupationFromChart(endTime) {
    setCustomOccupation({
      id: "custom",
      group: customOccupation.group,
      start_time: customOccupation.start_time,
      end_time: moment(endTime).isAfter(customOccupation.start_time) ? moment(endTime) : customOccupation.end_time,
      selectedBgColor: 'rgba(0,255,125,0.7)',
      bgColor: 'rgba(0,255,123,0.7)'
    })
  }

  function updateOccupationFromDatePicker(startTime, endTime) {
    setCustomOccupation({
      id: "custom",
      group: customOccupation.group,
      start_time: moment(startTime),
      end_time: moment(endTime),
      selectedBgColor: 'rgba(0,255,125,0.7)',
      bgColor: 'rgba(0,255,123,0.7)'
    })
  }

  function preprocess(beds) {
    return _.flatMap(beds, bed => {
      return [
        createUnavailableChartData(bed.id, moment("1950-01-01", "YYYY-MM-DD"), bed.addedAt),
        bed.removedAt ? createUnavailableChartData(bed.id, bed.removedAt, moment("2222-01-01", "YYYY-MM-DD")) : null,
        ..._.map(bed.removingPeriods, period => createUnavailableChartData(bed.id, period.from, period.to))
      ].filter($ => !!$);
    });
  }

  function createUnavailableChartData(id, from, to) {
    return {
      id: `${id}_${from}_${to}`,
      group: id.split("_")[1],
      title: 'niedostępne',
      start_time: moment(from, "YYYY-MM-DD HH:mm:ss"),
      end_time: moment(to, "YYYY-MM-DD HH:mm:ss"),
      canMove: false,
      canResize: false,
      canChangeGroup: false,
      selectedBgColor: 'rgba(124, 124, 124, 1)',
      bgColor: 'rgba(125, 125, 125, 1)'
    }
  }

  return (
    <div>
      <h2 className="text-center">Lista łóżek:</h2>
      <div className="container" style={{maxWidth: "700px"}}>
        <div className="row">
          <div className="col-9">
            <DateTimeRangePicker
              start={customOccupation.start_time?.format("YYYY-MM-DD HH:mm:ss")}
              end={customOccupation.end_time?.format("YYYY-MM-DD HH:mm:ss")}
              onChange={(start, end) => updateOccupationFromDatePicker(start, end)}
              label="Rezerwacja" customLabelWidth="100px"/>
          </div>
          <button className="col-2 btn btn-primary float-right mb-2" disabled={!customOccupation.start_time || !customOccupation.group} onClick={() => history.push(`${url}/${customOccupation.group}/${customOccupation.start_time.format("YYYYMMDDHHmmss")}_${customOccupation.end_time.format("YYYYMMDDHHmmss")}`)}>Dalej</button>
        </div>
      </div>
      {
        !beds.length ? <p className="text-center">Na tym oddziale nie ma łóżek.</p> : null
      }
      {!beds || !beds.length || !allOccupations.length ? "" : (
        <Timeline
        groups={beds}
        items={allOccupations}
        onCanvasDoubleClick={(groupId, time) => updateOccupationFromChart(time, groupId)}
        onItemResize={(itemId, time, edge) => {edge === "right" ? extendOccupationFromChart(time) : updateOccupationFromChart(time)}}
        onItemMove={(itemId, time, groupIndex) => {updateOccupationFromChart(time, beds[groupIndex].id)}}
        defaultTimeStart={moment().add(-12, 'hour')}
        defaultTimeEnd={moment().add(7*24-12, 'hour')}
        itemRenderer={({ item, timelineContext, itemContext, getItemProps, getResizeProps }) => {
          const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
          const backgroundColor = itemContext.selected ? item.selectedBgColor : item.bgColor;
          const borderColor = itemContext.resizing ? "red" : item.color;
          return (
            <div
              {...getItemProps({
                style: {
                  backgroundColor,
                  color: item.color,
                  borderColor,
                  borderStyle: "solid",
                  borderWidth: 1,
                  borderRadius: 4,
                  borderLeftWidth: itemContext.selected ? 3 : 1,
                  borderRightWidth: itemContext.selected ? 3 : 1
                }
              })}
            >
              {itemContext.useResizeHandle ? <div {...leftResizeProps} /> : null}

              <div
                style={{
                  height: itemContext.dimensions.height,
                  overflow: "hidden",
                  paddingLeft: 3,
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {itemContext.title}
              </div>

              {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : null}
            </div>
          );
        }}
      />
    )}
    </div>
  )
}
