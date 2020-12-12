import React, {useEffect, useState} from 'react';
import {useHistory, useParams, useRouteMatch} from "react-router-dom";
import bedsService from "../services/beds.service";
import * as _ from "lodash";
import moment from "moment";
import Timeline from "react-calendar-timeline";
import Input from "../components/input.component";

export default function Beds() {
  const history = useHistory();
  const { path, url } = useRouteMatch();
  const { departmentId, hospitalId } = useParams();
  const [beds, setBeds] = useState([]);
  const [occupations, setOccupations] = useState([]);
  const [allOccupations, setAllOccupations] = useState([]);
  const [customOccupation, setCustomOccupation] = useState({});

  useEffect(() => {
    setAllOccupations([...occupations, customOccupation].filter($ => $.start_time));
  }, [occupations, customOccupation])

  async function loadBeds() {
    const allBeds = await bedsService.loadAll(hospitalId, departmentId);

    setBeds(_.map(allBeds, $ => ({id: $.id.split("_")[1], title: $.id.split("_")[1]})));
    setOccupations(preprocess(allBeds));
    console.log(preprocess(allBeds));
  }

  function updateOccupation(groupId, startTime) {
    setCustomOccupation({
      id: "custom",
      group: groupId,
      start_time: moment(startTime),
      end_time: customOccupation.end_time ?
        moment(startTime).add(moment.duration(customOccupation.end_time.diff(customOccupation.start_time))) :
        moment(startTime).add(4, "days"),
      bgColor: 'rgb(0,255,123)'
    })
    console.log(customOccupation);
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

  useEffect(() => {
    loadBeds();
  }, []);

  function createUnavailableChartData(id, from, to) {
    return {
      id: `${id}_${from}_${to}`,
      group: id.split("_")[1],
      title: 'niedostępne',
      start_time: moment(from, "YYYY-MM-DD hh:mm"),
      end_time: moment(to, "YYYY-MM-DD hh:mm"),
      bgColor: 'rgba(125, 125, 125, 1)'
    }
  }

  return (
    <div>
      <h2 className="text-center">Lista łóżek:</h2>
      <div className="container" style={{maxWidth: "500px"}}>
        <span>{customOccupation.start_time ? `Od ${customOccupation.start_time.format("YYYY-MM-DD hh:mm")} do ${customOccupation.end_time.format("YYYY-MM-DD hh:mm")}` : ""}</span>
        <button disabled={!customOccupation.start_time} onClick={() => history.push(`${url}/${customOccupation.group}/${customOccupation.start_time.format("YYYYMMDDhhmm")}_${customOccupation.end_time.format("YYYYMMDDhhmm")}`)}>Dalej</button>
      </div>
      {!beds.length || !allOccupations.length ? "" : (
        <Timeline
        groups={beds}
        items={allOccupations}
        onCanvasDoubleClick={updateOccupation}
        defaultTimeStart={moment().add(-4, 'hour')}
        defaultTimeEnd={moment().add(24, 'hour')}
        itemRenderer={({ item, timelineContext, itemContext, getItemProps, getResizeProps }) => {
          const { left: leftResizeProps, right: rightResizeProps } = getResizeProps();
          const backgroundColor = itemContext.selected ? (itemContext.dragging ? "red" : item.selectedBgColor) : item.bgColor;
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
                },
                onMouseDown: () => {
                  console.log("on item click", item);
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
