import { toOnlyTimeString } from "./utils";

const CustomTick = (props) => {
  const { x, y, payload } = props;

  console.log("payload", payload);
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#666"
        // transform="rotate(-35)"
      >
        {toOnlyTimeString(payload.value)}
      </text>
    </g>
  );
};

export default CustomTick;
