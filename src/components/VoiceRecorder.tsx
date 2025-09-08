import React, { useRef, useEffect } from "react";

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
  const isInitializedRef = useRef(false);

  useEffect(() => {
    console.log("VoiceRecorder: isRecording changed to", isRecording);
    
    if (isRecording && !isInitializedRef.current) {
      startRecording();
    } else if (!isRecording && isInitializedRef.current) {
      stopRecording();
    }
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const getSupportedMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log("VoiceRecorder: Using mime type", type);
        return type;
      }
    }
    
    console.log("VoiceRecorder: No supported mime type found, using default");
    return '';
  };

  const startRecording = async () => {
    try {
      console.log("VoiceRecorder: Starting recording...");
      
      // Check if MediaRecorder is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("MediaRecorder or getUserMedia not supported in this browser");
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      console.log("VoiceRecorder: Microphone access granted");
      streamRef.current = stream;
      audioChunksRef.current = [];

      // Create MediaRecorder with fallback mime types
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, 
        mimeType ? { mimeType } : undefined
      );
      
      mediaRecorderRef.current = mediaRecorder;
      isInitializedRef.current = true;

      mediaRecorder.ondataavailable = (event) => {
        console.log("VoiceRecorder: Data available, size:", event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log("VoiceRecorder: Recording stopped, creating blob...");
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mimeType || 'audio/webm' 
        });
        console.log("VoiceRecorder: Blob created, size:", audioBlob.size);
        onRecordingComplete(audioBlob);
        isInitializedRef.current = false;
      };

      mediaRecorder.onerror = (event) => {
        console.error("VoiceRecorder: MediaRecorder error", event);
        onError("Recording failed. Please try again.");
        cleanup();
      };

      mediaRecorder.onstart = () => {
        console.log("VoiceRecorder: Recording started successfully");
      };

      console.log("VoiceRecorder: Starting MediaRecorder...");
      mediaRecorder.start(100); // Collect data every 100ms
      
    } catch (error) {
      console.error("VoiceRecorder: Error starting recording:", error);
      isInitializedRef.current = false;
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          onError("Microphone access denied. Please allow microphone access and try again.");
        } else if (error.name === 'NotFoundError') {
          onError("No microphone found. Please check your microphone connection.");
        } else if (error.name === 'NotSupportedError') {
          onError("Audio recording not supported in this browser.");
        } else {
          onError(`Could not access microphone: ${error.message}`);
        }
      } else {
        onError("Could not access microphone. Please check permissions.");
      }
      cleanup();
    }
  };

  const stopRecording = () => {
    console.log("VoiceRecorder: Stopping recording...");
    if (mediaRecorderRef.current) {
      const state = mediaRecorderRef.current.state;
      console.log("VoiceRecorder: MediaRecorder state:", state);
      
      if (state === "recording") {
        mediaRecorderRef.current.stop();
      } else if (state === "paused") {
        mediaRecorderRef.current.resume();
        mediaRecorderRef.current.stop();
      }
    }
  };

  const cleanup = () => {
    console.log("VoiceRecorder: Cleaning up...");
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log("VoiceRecorder: Stopped track:", track.kind);
      });
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    isInitializedRef.current = false;
  };

  return null; // This component doesn't render anything visible
};