import React from "react";
import "./DigitDisplay.scss";

interface DigitDisplayProps {
  value: number;
  digits?: number;
  sx?: React.CSSProperties;
}

const DigitDisplay: React.FC<DigitDisplayProps> = ({ value, digits = 5, sx }) => {
  const paddedValue = value.toString().padStart(digits, "0");
  const firstNonZeroIndex = paddedValue.search(/[1-9]/);
  const isAllZeros = firstNonZeroIndex === -1;
  
  return (
    <div className="digit-display" style={sx}>
      {Array.from(paddedValue).map((char, index) => {
        const isLeadingZero = char === "0" && 
          (!isAllZeros && index < firstNonZeroIndex) ||
          (isAllZeros && index < paddedValue.length - 1);
        
        return (
          <span 
            key={index} 
            className={`digit ${isLeadingZero ? "leading-zero" : ""}`}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

export default DigitDisplay;