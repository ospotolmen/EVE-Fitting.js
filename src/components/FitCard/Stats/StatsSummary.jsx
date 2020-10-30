import React from "react";
import Resistance from "./Resistance";
import Resources from "./Resouces";
import Damage from "./Damage";
import Engineering from "./Engineering";
import Capacitor from "./Capacitor";
import Stat from "./services/Stat";
import { useEffect } from "react";

export default function StatsSummary(props) {
  useEffect(() => {
    props.setStat(Stat.stat(props.fit));
  }, [props.fitID]);

  return (
    <React.Fragment>
      <Resources {...props} />
      <Damage {...props} />
      <Capacitor {...props} />
      <Resistance {...props} />
      <Engineering {...props} />
    </React.Fragment>
  );
}
