import { useEffect, useMemo, useState } from "react";
import "./App.css";
import CurrentTimeHeader from "../CurrentTimeHeader";

// const BASE_URL = 'http://taiwan-sms.net/Iot/'
const BASE_URL = "http://localhost:5566/";

function App() {
  const [x, setX] = useState(5);
  const [cameraList, setCameraList] = useState([]);
  const [sensorList, setSensorList] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

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

  console.log(uniqueSensorNames);

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
        <select>
          {uniqueCameraNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default App;
