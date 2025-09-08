import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, Volume2 } from "lucide-react";
import { VoiceRecorder } from "./VoiceRecorder";
import { Waveform } from "./Waveform";
import { ConversationHistory } from "./ConversationHistory";
import { toast } from "sonner";
import heroImage from "@/assets/voice-assistant-hero.jpg";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isAudio?: boolean;
}

export const VoiceAssistant = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI voice assistant. Click the microphone to start talking with me.",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);

  const handleStartRecording = () => {
    console.log("VoiceAssistant: Starting recording...");
    setIsRecording(true);
    toast.success("Recording started... Speak now!");
  };

  const handleStopRecording = () => {
    console.log("VoiceAssistant: Stopping recording...");
    setIsRecording(false);
  };

  const handleRecordingComplete = (audioBlob: Blob) => {
    console.log("VoiceAssistant: Recording completed, blob size:", audioBlob.size);
    setIsRecording(false);
    setIsProcessing(true);
    
    // Add user message placeholder
    const userMessage: Message = {
      id: Date.now().toString(),
      content: `Voice message recorded (${Math.round(audioBlob.size / 1024)}KB)`,
      role: "user",
      timestamp: new Date(),
      isAudio: true,
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate processing (replace with actual backend call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I received your voice message! This is where I would process your audio and respond. Backend integration coming soon!",
        role: "assistant",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
      
      toast.success("Response ready!");
    }, 2000);
  };

  const handleRecordingError = (error: string) => {
    console.error("VoiceAssistant: Recording error:", error);
    setIsRecording(false);
    setIsProcessing(false);
    toast.error(error);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-voice-primary/20 via-background to-voice-secondary/20" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-voice-primary to-voice-secondary bg-clip-text text-transparent">
            AI Voice Assistant
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the future of AI conversation with natural voice interaction
          </p>
        </div>

        {/* Main Voice Interface */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl mb-8">
            <div className="p-8">
              {/* Voice Controls */}
              <div className="flex flex-col items-center space-y-8">
                {/* Recording Button */}
                <div className="relative">
                  <Button
                    size="lg"
                    variant={isRecording ? "destructive" : "default"}
                    className={`w-24 h-24 rounded-full transition-all duration-300 ${
                      isRecording 
                        ? "animate-recording-pulse bg-voice-recording hover:bg-voice-recording/90" 
                        : "animate-pulse-glow bg-gradient-to-r from-voice-primary to-voice-secondary hover:from-voice-primary/90 hover:to-voice-secondary/90"
                    }`}
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    disabled={isProcessing}
                  >
                    {isRecording ? (
                      <MicOff className="w-8 h-8" />
                    ) : (
                      <Mic className="w-8 h-8" />
                    )}
                  </Button>
                  
                  {/* Status indicator */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <p className="text-sm font-medium text-center">
                      {isRecording ? (
                        <span className="text-voice-recording">Recording...</span>
                      ) : isProcessing ? (
                        <span className="text-voice-secondary">Processing...</span>
                      ) : (
                        <span className="text-muted-foreground">Tap to speak</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Waveform Visualization */}
                {(isRecording || isProcessing || isPlaying) && (
                  <div className="w-full max-w-md">
                    <Waveform 
                      isActive={isRecording || isProcessing || isPlaying}
                      type={isRecording ? "recording" : isProcessing ? "processing" : "playing"}
                    />
                  </div>
                )}

                {/* Voice Recorder */}
                <VoiceRecorder
                  isRecording={isRecording}
                  onRecordingComplete={handleRecordingComplete}
                  onError={handleRecordingError}
                />
              </div>
            </div>
          </Card>

          {/* Conversation History */}
          <ConversationHistory messages={messages} />
        </div>
      </div>
    </div>
  );
};