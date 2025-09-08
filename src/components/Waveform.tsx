import React from "react";

interface WaveformProps {
  isActive: boolean;
  type: "recording" | "processing" | "playing";
}

export const Waveform: React.FC<WaveformProps> = ({ isActive, type }) => {
  const bars = Array.from({ length: 32 }, (_, i) => i);
  
  const getBarColor = () => {
    switch (type) {
      case "recording":
        return "bg-voice-recording";
      case "processing":
        return "bg-voice-secondary";
      case "playing":
        return "bg-voice-success";
      default:
        return "bg-voice-primary";
    }
  };

  const getBarHeight = (index: number) => {
    const baseHeight = Math.sin((index / bars.length) * Math.PI) * 40 + 20;
    return `${baseHeight}%`;
  };

  return (
    <div className="flex items-center justify-center space-x-1 h-20 px-4">
      {bars.map((bar, index) => (
        <div
          key={bar}
          className={`w-1 rounded-full transition-all duration-150 ${getBarColor()} ${
            isActive ? "animate-waveform" : ""
          }`}
          style={{
            height: isActive ? getBarHeight(index) : "20%",
            animationDelay: `${index * 50}ms`,
          }}
        />
      ))}
    </div>
  );
};