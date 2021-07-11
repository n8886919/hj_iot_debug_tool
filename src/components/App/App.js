import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./App.css";
import CurrentTimeHeader from "../CurrentTimeHeader";
import CustomTick from "./CustomTick";
import CustomTooltip from "./CustomTooltip";

// const BASE_URL = 'http://taiwan-sms.net/Iot/'
const BASE_URL = "http://localhost:5566/";

// http://123.195.205.170:8123/local/snapshot/1624431794.989642.jpg

const getTimeStamp = (dateString) => {
  return new Date(dateString) / 1000;
};

const toTimeString = (s) => {
  const time = new Date(s * 1000);
  // return `${time.getFullYear()} / ${time.getMonth()} / ${time.getDate()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
  const format = new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "full",
    timeStyle: "medium",
  });
  const msString = time.getMilliseconds().toString();
  const prefix = Array(3 - msString.length)
    .fill("0")
    .join();
  return format.format(time) + "." + prefix + time.getMilliseconds();
};

const useCamera = ({ startTime, endTime, x, setCameraImgPath }) => {
  const [cameraName, setCameraName] = useState("");
  const [cameraList, setCameraList] = useState([]);
  const [cameraTimeSetIndex, setCameraTimeSetIndex] = useState(0);

  useEffect(() => {
    const fetchCameraList = async () => {
      const res = await fetch(`${BASE_URL}camera`);

      const data = await res.json();
      setCameraList(data);
    };
    fetchCameraList();
  }, []);

  const uniqueCameraNames = useMemo(() => {
    const a = cameraList.map(({ camera_name }) => camera_name);
    return [...new Set(a)];
  }, [cameraList]);

  const selectedCameraList = useMemo(() => {
    return cameraList.filter(({ camera_name }) => camera_name === cameraName);
  }, [cameraList, cameraName]);

  const cameraTimeSets = useMemo(() => {
    return selectedCameraList
      .filter(
        ({ timestamp }) =>
          timestamp > getTimeStamp(startTime) &&
          timestamp < getTimeStamp(endTime)
      )
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [endTime, selectedCameraList, startTime]);

  const cameraTimeSetsByX = useMemo(() => {
    let previousTimestamp = 0;
    let a = [];
    let tmp = [];
    cameraTimeSets.forEach((camera, index) => {
      if (index === 0) {
        tmp.push(camera);
      } else if (camera.timestamp - previousTimestamp < x) {
        tmp.push(camera);
      } else {
        a.push(tmp);
        tmp = [];
        tmp.push(camera);
      }

      previousTimestamp = camera.timestamp;
    });
    if (tmp.length > 0) {
      a.push(tmp);
    }

    return a;
  }, [cameraTimeSets, x]);

  useEffect(() => {
    const currentCameraSet = cameraTimeSetsByX[cameraTimeSetIndex];
    if (cameraTimeSetsByX[cameraTimeSetIndex]) {
      setCameraImgPath(currentCameraSet[0].img);
    }
  }, [cameraTimeSetsByX, cameraTimeSetIndex, setCameraImgPath]);

  return {
    cameraName,
    setCameraName,
    uniqueCameraNames,
    cameraTimeSetIndex,
    setCameraTimeSetIndex,
    cameraTimeSetsByX,
  };
};

const useSensor = ({ startTime, endTime, x }) => {
  const [timestamp, setTimestamp] = useState("0-0");
  const [chartStartTime, chartEndTime] = timestamp.split("-");

  const [sensorList, setSensorList] = useState([]);

  const [sensor1Name, setSensor1Name] = useState("");
  const [sensor2Name, setSensor2Name] = useState("");

  useEffect(() => {
    const fetchSensorList = async () => {
      const res = await fetch(`${BASE_URL}sensor`);

      const data = await res.json();
      setSensorList(data);
    };
    fetchSensorList();
  }, []);

  const uniqueSensorNames = useMemo(() => {
    const a = sensorList.map(({ sensor_name }) => sensor_name);
    return [...new Set(a)];
  }, [sensorList]);

  const selectedSensor1List = useMemo(() => {
    return sensorList.filter(({ sensor_name }) => sensor_name === sensor1Name);
  }, [sensorList, sensor1Name]);

  const selectedSensor2List = useMemo(() => {
    return sensorList.filter(({ sensor_name }) => sensor_name === sensor2Name);
  }, [sensorList, sensor2Name]);

  const sensor1TimeSets = useMemo(() => {
    return selectedSensor1List
      .filter(
        ({ timestamp }) =>
          timestamp > getTimeStamp(startTime) &&
          timestamp < getTimeStamp(endTime)
      )
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [endTime, selectedSensor1List, startTime]);

  const sensor2TimeSets = useMemo(() => {
    return selectedSensor2List
      .filter(
        ({ timestamp }) =>
          timestamp > getTimeStamp(startTime) &&
          timestamp < getTimeStamp(endTime)
      )
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [endTime, selectedSensor2List, startTime]);

  const sensor1TimeSetsInChart = useMemo(() => {
    return sensor1TimeSets.filter(
      ({ timestamp }) =>
        timestamp >= chartStartTime && timestamp <= chartEndTime
    );
    // .map(({ value, ...others }) => ({ ...others, s1: value }));
  }, [chartEndTime, chartStartTime, sensor1TimeSets]);

  const sensor2TimeSetsInChart = useMemo(() => {
    return sensor2TimeSets
      .filter(
        ({ timestamp }) =>
          timestamp >= chartStartTime && timestamp <= chartEndTime
      )
      .map(({ value, ...others }) => ({ ...others, value: value * -1 }));
  }, [chartEndTime, chartStartTime, sensor2TimeSets]);

  const sensor1TimeIntervalByX = useMemo(() => {
    if (sensor1TimeSets.length === 0) return [];

    let previousTimestamp = 0;
    let a = [];
    let tmp = {};
    sensor1TimeSets.forEach(({ timestamp }, index) => {
      if (index === 0) {
        tmp.startTime = timestamp;
        tmp.endTime = timestamp + 5;
      } else if (timestamp - previousTimestamp < x) {
        tmp.endTime = timestamp;
      } else {
        a.push(tmp);
        tmp = {
          startTime: timestamp,
          endTime: timestamp + 5,
        };
      }

      previousTimestamp = timestamp;
    });
    a.push(tmp);

    return a;
  }, [sensor1TimeSets, x]);

  const sensor2TimeIntervalByX = useMemo(() => {
    if (sensor2TimeSets.length === 0) return [];

    let previousTimestamp = 0;
    let a = [];
    let tmp = {};
    sensor2TimeSets.forEach(({ timestamp }, index) => {
      if (index === 0) {
        tmp.startTime = timestamp;
        tmp.endTime = timestamp + 5;
      } else if (timestamp - previousTimestamp < x) {
        tmp.endTime = timestamp;
      } else {
        a.push(tmp);
        tmp = {
          startTime: timestamp,
          endTime: timestamp + 5,
        };
      }

      previousTimestamp = timestamp;
    });
    a.push(tmp);

    return a;
  }, [sensor2TimeSets, x]);

  const mergedTimeSetsIntervalByX = useMemo(() => {
    if (sensor1Name === sensor2Name) return sensor1TimeIntervalByX;

    return sensor1TimeIntervalByX
      .concat(sensor2TimeIntervalByX)
      .sort((a, b) => a.startTime - b.startTime);
  }, [
    sensor1Name,
    sensor1TimeIntervalByX,
    sensor2Name,
    sensor2TimeIntervalByX,
  ]);

  const chartData = useMemo(() => {
    return sensor1TimeSetsInChart.concat(sensor2TimeSetsInChart);
  }, [sensor1TimeSetsInChart, sensor2TimeSetsInChart]);

  return {
    chartData,
    timestamp,
    setTimestamp,

    chartStartTime,
    chartEndTime,

    uniqueSensorNames,

    sensor1Name,
    setSensor1Name,
    sensor1TimeSetsInChart,
    sensor2TimeSetsInChart,

    sensor1TimeIntervalByX,
    mergedTimeSetsIntervalByX,

    sensor2Name,
    setSensor2Name,
  };
};

function App() {
  const [x, setX] = useState(5);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [cameraImgPath, setCameraImgPath] = useState("");

  const {
    cameraName,
    setCameraName,
    uniqueCameraNames,
    cameraTimeSetIndex,
    setCameraTimeSetIndex,
    cameraTimeSetsByX,
  } = useCamera({ startTime, endTime, x, setCameraImgPath });

  const {
    chartData,
    uniqueSensorNames,
    timestamp,
    setTimestamp,

    sensor1TimeSetsInChart,
    sensor2TimeSetsInChart,

    sensor1Name,
    setSensor1Name,

    mergedTimeSetsIntervalByX,

    sensor2Name,
    setSensor2Name,
  } = useSensor({ startTime, endTime, x });

  console.log("chartData", chartData);
  console.log("sensor1TimeSetsInChart", sensor1TimeSetsInChart);
  console.log("sensor2TimeSetsInChart", sensor2TimeSetsInChart);
  console.log("mergedTimeSetsIntervalByX", mergedTimeSetsIntervalByX);

  return (
    <div className="App">
      <CurrentTimeHeader />
      <div>
        <label>間隔</label>
        <input type="number" value={x} onChange={(e) => setX(e.target.value)} />
      </div>
      <div>
        <label>起始時間</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>
      <div>
        <label>結束時間</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>
      <div>
        <label>Camera</label>
        <select
          value={cameraName}
          onChange={(e) => setCameraName(e.target.value)}
        >
          <option disabled></option>

          {uniqueCameraNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Camera Time Sets</label>
        <select
          value={cameraTimeSetIndex}
          onChange={(e) => setCameraTimeSetIndex(e.target.value)}
        >
          <option disabled></option>

          {cameraTimeSetsByX.map((timeSet, i) => (
            <option key={i} value={i}>
              {toTimeString(timeSet[0].timestamp)}
            </option>
          ))}
        </select>
      </div>
      <div>
        {cameraImgPath && (
          <img
            style={{ maxWidth: "100%" }}
            src={`http://123.195.205.170:8123/local/snapshot/${cameraImgPath}.jpg`}
            alt="img"
          />
        )}
      </div>

      <div>
        <label>Sensor1</label>
        <select
          value={sensor1Name}
          onChange={(e) => setSensor1Name(e.target.value)}
        >
          <option disabled></option>

          {uniqueSensorNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Sensor2</label>
        <select
          value={sensor2Name}
          onChange={(e) => setSensor2Name(e.target.value)}
        >
          <option disabled></option>

          {uniqueSensorNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Sensor Time Sets</label>
        <select
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
        >
          <option disabled value="0-0"></option>

          {mergedTimeSetsIntervalByX.map(({ startTime, endTime }) => (
            <option
              key={`${startTime}-${endTime}`}
              value={`${startTime}-${endTime}`}
            >
              {toTimeString(startTime)}
            </option>
          ))}
        </select>
      </div>
      <div style={{ width: "100%", height: "300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="timestamp"
              domain={["dataMin", "dataMax"]}
              tick={<CustomTick />}
              tickCount={100}
              interval="preserveStartEnd"
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#DBE2ED" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;
