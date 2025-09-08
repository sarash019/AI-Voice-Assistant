import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Bot, Volume2 } from "lucide-react";
import { Message } from "./VoiceAssistant";

interface ConversationHistoryProps {
  messages: Message[];
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({ messages }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-voice-primary" />
          Conversation History
        </h3>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "user"
                      ? "bg-voice-primary text-primary-foreground"
                      : "bg-voice-secondary text-primary-foreground"
                  }`}
                >
                  {message.role === "user" ? (
                    <Mic className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    message.role === "user"
                      ? "bg-voice-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs opacity-75">
                      {message.role === "user" ? "You" : "Assistant"}
                    </span>
                    {message.isAudio && (
                      <Badge variant="secondary" className="text-xs">
                        Audio
                      </Badge>
                    )}
                    <span className="text-xs opacity-50">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};