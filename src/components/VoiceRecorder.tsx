import React, { useRef, useEffect, useState } from "react";

interface VoiceRecorderProps {
  isRecording: boolean;
  onRecordingComplete: (audioBlob: Blob) => void;
  onError: (error: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isRecording,
  onRecordingComplete,
  onError,
}) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => {
      cleanup();
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: 'audio/webm;codecs=opus' 
        });
        onRecordingComplete(audioBlob);
        cleanup();
      };

      mediaRecorder.onerror = () => {
        onError("Recording failed. Please try again.");
        cleanup();
      };

      mediaRecorder.start(100); // Collect data every 100ms
    } catch (error) {
      console.error("Error starting recording:", error);
      onError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  };

  return null; // This component doesn't render anything visible
};