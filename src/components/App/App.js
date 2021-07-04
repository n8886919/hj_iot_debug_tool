import { useState } from "react";
import "./App.css";
import CurrentTimeHeader from "../CurrentTimeHeader";

function App() {
  const [x, setX] = useState(5);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
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
    </div>
  );
}

export default App;
