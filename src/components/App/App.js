import { useEffect, useMemo, useState } from "react";
import "./App.css";
import CurrentTimeHeader from "../CurrentTimeHeader";

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
  const [timestamp, setTimestamp] = useState(0);
  const [sensorList, setSensorList] = useState([]);

  const [sensor1Name, setSensor1Name] = useState("");
  const [sensor2Name, setSensor2Name] = useState("");

  const [sensor1TimeSetIndex, setSensor1TimeSetIndex] = useState(0);
  const [sensor2TimeSetIndex, setSensor2TimeSetIndex] = useState(0);

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

  const sensor1TimeSetsFirstItemsByX = useMemo(() => {
    let previousTimestamp = 0;
    let firstItems = [];
    sensor1TimeSets.forEach((sensor) => {
      if (sensor.timestamp - previousTimestamp > x) {
        firstItems.push(sensor);
      }
      previousTimestamp = sensor.timestamp;
    });

    return firstItems;
  }, [sensor1TimeSets, x]);

  const sensor2TimeSetsFirstItemsByX = useMemo(() => {
    let previousTimestamp = 0;
    let firstItems = [];
    sensor2TimeSets.forEach((sensor) => {
      if (sensor.timestamp - previousTimestamp > x) {
        firstItems.push(sensor);
      }
      previousTimestamp = sensor.timestamp;
    });

    return firstItems;
  }, [sensor2TimeSets, x]);

  const mergedTimeSetsFirstItemsByX = useMemo(() => {
    if (sensor1Name === sensor2Name) return sensor1TimeSetsFirstItemsByX;

    return sensor1TimeSetsFirstItemsByX
      .concat(sensor2TimeSetsFirstItemsByX)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [
    sensor1Name,
    sensor1TimeSetsFirstItemsByX,
    sensor2Name,
    sensor2TimeSetsFirstItemsByX,
  ]);

  return {
    timestamp,
    setTimestamp,

    uniqueSensorNames,

    sensor1Name,
    setSensor1Name,
    sensor1TimeSetIndex,
    setSensor1TimeSetIndex,
    sensor1TimeSets,

    sensor1TimeSetsFirstItemsByX,
    sensor2TimeSetsFirstItemsByX,

    mergedTimeSetsFirstItemsByX,

    sensor2Name,
    setSensor2Name,
    sensor2TimeSetIndex,
    setSensor2TimeSetIndex,
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
    uniqueSensorNames,
    timestamp,
    setTimestamp,

    sensor1Name,
    setSensor1Name,
    sensor1TimeSets,

    sensor1TimeSetsFirstItemsByX,
    sensor2TimeSetsFirstItemsByX,
    mergedTimeSetsFirstItemsByX,

    sensor2Name,
    setSensor2Name,
    sensor2TimeSetIndex,
    setSensor2TimeSetIndex,
  } = useSensor({ startTime, endTime, x });

  console.log("sensor1TimeSets", sensor1TimeSets);

  console.log("sensor1TimeSetsFirstItemsByX", sensor1TimeSetsFirstItemsByX);
  console.log("sensor2TimeSetsFirstItemsByX", sensor2TimeSetsFirstItemsByX);
  console.log("mergedTimeSetsFirstItemsByX", mergedTimeSetsFirstItemsByX);
  console.log("cameraTimeSetsByX", cameraTimeSetsByX);
  console.log("timestamp", timestamp);

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
        <label>Merged Time Sets</label>
        <select
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
        >
          <option disabled value={0}></option>

          {mergedTimeSetsFirstItemsByX.map(({ timestamp }, i) => (
            <option key={timestamp} value={timestamp}>
              {toTimeString(timestamp)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default App;
