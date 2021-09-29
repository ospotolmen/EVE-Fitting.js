import { Grid } from "@material-ui/core";
import React, { useReducer, useEffect, useState, useRef } from "react";
import Fit from "../../fitter/src/Fit";
import { HAL } from "../FitCard/Stats/services/Simulator";
import Summary from "../FitCard/Stats/services/Summary";
import ContorlPanel from "./ContorlPanel";
import ShipStatusPanel from "./ShipStatusPanel";

const summariesReducer = (state, action) => {
  switch (action.type) {
    case "initialize":
      return action.payload;

    case "moduleSet_update_activation":
      action.payload.moduleSet.forEach((module) => {
        module.summary.activationState.isActive = action.payload.isActive;
      });

      return { ...state };

    case "activationLeft_active_discharge":
      action.payload.moduleSet.forEach((module) => {
        module.summary.activationState.activationLeft--;
      });

      return { ...state };

    case "activationLeft_active_charge":
      action.payload.moduleSet.forEach((module) => {
        module.summary.activationState.activationLeft =
          module.summary.activationInfo.activationLimit;
      });

      return { ...state };

    case "summary_load_apply_delta":
      state.summary.load.shield.HP = calculateHP(state, action, "shield");
      state.summary.load.armor.HP = calculateHP(state, action, "armor");
      state.summary.load.structure.HP = calculateHP(state, action, "structure");
      state.summary.load.capacitor.HP = calculateHP(state, action, "capacitor");

      return { ...state };

    default:
      console.log("ERR NO KNOWN CASE IN ShipPanel.js");
      return state;
  }
};

export default function ShipPanel(props) {
  //prettier-ignore
  const [summaries, dispatchSummaries] = useReducer(summariesReducer, false);
  const [updateFlag, setUpdateFlag] = useState(false);

  useEffect(() => {
    props.shareDispatchSummaries(() => dispatchSummaries);
  }, [dispatchSummaries]);

  //Initialize
  useEffect(() => {
    if (!props.slots) return;

    const _summaries = Summary.getSummaries(props.slots, props.location);
    //prettier-ignore
    _summaries.resistanceTable = Summary.getResistanceTable(_summaries, props.slots);
    _summaries.skills = undefined;

    dispatchSummaries({ type: "initialize", payload: _summaries });
    props.shareSummaries(_summaries);
    setUpdateFlag(!updateFlag);
  }, [props.updateFlag]);

  //Set target
  useEffect(() => {
    HAL.getSchedules_setTarget(summaries, props.targetSummaries);
  }, [props.targetSummaries]);

  return (
    <React.Fragment>
      <Grid xs={12} container item justify="center">
        <ShipStatusPanel summaries={summaries} />
      </Grid>
      <Grid xs={12} container item justify="center">
        <ContorlPanel
          summaries={summaries}
          dispatchSummaries={dispatchSummaries}
          dispatchTargetSummaries={props.dispatchTargetSummaries}
          updateFlag={updateFlag}
        />
      </Grid>
    </React.Fragment>
  );
}

function calculateHP(state, action, type) {
  const currentValue = state.summary.load[`${type}`].HP;
  const deltaValue = action.payload[`${type}Delta`];
  const maxValue = state.summary.capacity[`${type}`].HP;

  if (!deltaValue) return currentValue;

  const result = currentValue + deltaValue;
  if (result > maxValue) return maxValue;
  else if (result < 0) return 0;
  else return result;
}
