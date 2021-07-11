import { toOnlyTimeString } from "./utils";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p>{`Timestamp: ${label}`}</p>
        <p>{`Time: ${toOnlyTimeString(label)}`}</p>
        <p>{`Value:  : ${payload[0].value}`}</p>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
