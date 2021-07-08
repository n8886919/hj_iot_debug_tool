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
  return Date(s * 1000);
};

function App() {
  const [x, setX] = useState(5);
  const [cameraName, setCameraName] = useState("");
  const [sensor1Name, setSensor1Name] = useState("");
  const [sensor2Name, setSensor2Name] = useState("");

  const [cameraList, setCameraList] = useState([]);
  const [sensorList, setSensorList] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // const [cameraTimeSet, setCameraTimeSet] = useState("");
  const [cameraTimeSetIndex, setCameraTimeSetIndex] = useState(0);
  const [cameraImgPath, setCameraImgPath] = useState("");

  console.log(startTime);

  useEffect(() => {
    const fetchCameraList = async () => {
      const res = await fetch(`${BASE_URL}camera`);

      const data = await res.json();
      setCameraList(data);
    };
    fetchCameraList();
  }, []);

  useEffect(() => {
    const fetchSensorList = async () => {
      const res = await fetch(`${BASE_URL}sensor`);

      const data = await res.json();
      setSensorList(data);
    };
    fetchSensorList();
  }, []);

  const uniqueCameraNames = useMemo(() => {
    const a = cameraList.map(({ camera_name }) => camera_name);
    return [...new Set(a)];
  }, [cameraList]);

  const uniqueSensorNames = useMemo(() => {
    const a = sensorList.map(({ sensor_name }) => sensor_name);
    return [...new Set(a)];
  }, [sensorList]);

  const selectedCameraList = useMemo(() => {
    return cameraList.filter(({ camera_name }) => camera_name === cameraName);
  }, [cameraList, cameraName]);

  const cameraTimeSets = useMemo(() => {
    return selectedCameraList.filter(
      ({ timestamp }) =>
        timestamp > getTimeStamp(startTime) && timestamp < getTimeStamp(endTime)
    );
    // .sort((a, b) => a.timestamp - b.timestamp);
  }, [endTime, selectedCameraList, startTime]);

  const cameraTimeSetsByX = useMemo(() => {
    let previousTimestamp = 0;
    let a = [];
    let tmp = [];
    selectedCameraList.forEach((camera, index) => {
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
  }, [selectedCameraList, x]);

  useEffect(() => {
    const currentCameraSet = cameraTimeSetsByX[cameraTimeSetIndex];
    if (cameraTimeSetsByX[cameraTimeSetIndex]) {
      setCameraImgPath(currentCameraSet[0].img);
    }
  }, [cameraTimeSetsByX, cameraTimeSetIndex]);

  console.log("selectedCameraList", selectedCameraList);
  console.log("cameraTimeSets", cameraTimeSets);
  console.log("cameraTimeSetsByX", cameraTimeSetsByX);

  console.log(
    "cameraTimeSetsByX[cameraTimeSetIndex]",
    cameraTimeSetsByX[cameraTimeSetIndex]
  );

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
            src={`http://123.195.205.170:8123/local/snapshot/${cameraImgPath}.jpg`}
          />
        )}
      </div>
    </div>
  );
}

export default App;
