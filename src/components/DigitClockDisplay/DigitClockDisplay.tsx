import React, { useEffect, useState } from "react";
import "./DigitClockDisplay.scss";

interface DigitClockDisplayProps {
  startTime: Date;
  paused: boolean;
  sx?: React.CSSProperties;
}

const DigitClockDisplay: React.FC<DigitClockDisplayProps> = ({ startTime, paused = false, sx }) => {
  const [timeElapsed, setTimeElapsed] = useState<string>("00:00:00");

  useEffect(() => {
    const updateElapsedTime = () => {
      if (paused) {
        return;
      }
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      
      let hours = Math.floor(diffInSeconds / 3600);
      let remaining = diffInSeconds % 3600;
      let minutes = Math.floor(remaining / 60);
      let seconds = remaining % 60;
      
      // Cap at 99:59:59
      if (hours > 99) {
        hours = 99;
        minutes = 59;
        seconds = 59;
      }
      
      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = seconds.toString().padStart(2, "0");
      
      setTimeElapsed(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
    };

    updateElapsedTime();
    
    const intervalId = setInterval(updateElapsedTime, 1000);
    
    return () => clearInterval(intervalId);
  }, [startTime, paused]);

  return (
    <div className="digit-clock-display" style={sx}>
      {timeElapsed.split("").map((char, index) => (
        <span 
          key={index} 
          className={`digit ${char === ":" ? "colon" : ""}`}
        >
          {char}
        </span>
      ))}
    </div>
  );
};

export default DigitClockDisplay;