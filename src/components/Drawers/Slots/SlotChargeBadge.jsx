import React from "react";
import { Badge, Avatar, makeStyles } from "@material-ui/core";
import { useCallback } from "react";
import { useState } from "react";
import { useEffect } from "react";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";
import AdjustIcon from "@material-ui/icons/Adjust";
import Fit from "../../../fitter/src/Fit";

const useStyles = makeStyles((theme) => ({
  rootAvatar: {
    width: 20,
    height: 20,
    color: "#ffffff",
    backgroundColor: "#000000",
    right: 15,
    bottom: 3,
    fontSize: 12,
    fontWeight: 700,
    transition: theme.transitions.create("color", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
}));

export default function SlotChargeBadge(props) {
  const classes = useStyles();

  const [badgeColor, setBadgeColor] = useState({
    color: "#000000",
    backgroundColor: "#ffffff",
  });
  const [badgeIcon, setBadgeIcon] = useState(false);

  const handleBadgeClick = useCallback(
    (e) => {
      e.stopPropagation();
      if (props.variant !== "DRONE_SLOT")
        props.dispatchSlotsOpen({
          type: "AMMO",
          payload: {
            slotVariant: props.variant,
            filter: getLoadableGroup(props.item),
          },
        });
      props.setActiveSlotNumber(props.index);
      props.setActiveSlot({
        type: props.variant,
        index: props.index,
      });
    },
    [props.index, props.variant, props.item]
  );
  useEffect(() => {
    if (props.count !== undefined && props.count.constructor === Number) {
      // count of item
      setBadgeIcon(`${props.count}`);
    } else if (!props.charge) {
      // No charge loaded
      setBadgeIcon(<AddCircleOutlineIcon fontSize="small" />);
      setBadgeColor({
        color: "#000000",
        backgroundColor: "#ffffff",
        border: "0.1px solid rgb(235, 235, 235)",
      });
    } else if (
      !Fit.validateChargeSlot({ item: props.item, charge: props.charge })
    ) {
      // Charge not compatible
      setBadgeColor({
        color: "#ffffff",
        backgroundColor: "#ff4242",
      });
      setBadgeIcon(<HighlightOffIcon fontSize="small" />);
    } else {
      // Charge loaded
      setBadgeColor({
        color: "#000000",
        backgroundColor: "#ffffff",
        border: "0.1px solid rgb(235, 235, 235)",
      });
      setBadgeIcon(<AdjustIcon fontSize="small" />);
    }
  }, [props.charge?.typeID, props.item?.typeID, props.count]);

  return (
    <Badge
      overlap="circle"
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      badgeContent={
        getLoadableGroup(props.item).group.length > 0 ||
        isDisplyCount(props.count) ? (
          <Avatar
            className={classes.rootAvatar}
            style={{
              ...badgeColor,
            }}
            onClick={handleBadgeClick}
          >
            {badgeIcon}
          </Avatar>
        ) : undefined
      }
    >
      {props.children}
    </Badge>
  );
}
function isDisplyCount(count) {
  if (count !== undefined && count.constructor === Number) return true;
  return false;
}

export function getLoadableGroup(item) {
  if (!item || !item.typeAttributesStats) return { group: [], size: false };

  const typeAttributesStats = item.typeAttributesStats;

  // Used with (Charge Group)[attributeID] = 604, 605, 606, 609, 610
  const loadableGroupIDs = [604, 605, 606, 609, 610]
    .map((ID) => {
      const attr = typeAttributesStats.find((attr) => attr.attributeID === ID);
      if (!attr) return undefined;
      else return attr.value;
    })
    .filter((value) => value);

  // Charge size[attributeID] = 128
  const loadableSize = typeAttributesStats.find(
    (attr) => attr.attributeID === 128
  );

  return {
    group: loadableGroupIDs,
    size: loadableSize?.value,
  };
}
