import { useEffect, useState } from 'react';
const CurrentTimeHeader = () => {
  const [currentTime, setCurrentTime] = useState(Date());
  useEffect(() => {
    const intervalID = setInterval(() => {
      setCurrentTime(Date());
    }, 1000);
    return () => {clearInterval(intervalID)}
  }, [])

  return <div>{currentTime}</div>
}

export default CurrentTimeHeader