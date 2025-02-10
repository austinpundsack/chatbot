"use client";

import axios from "axios";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [typing, setTyping] = useState<boolean>(false); // To track when bot is typing
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);


  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = { role: "user", content: message };
    setChat((prevChat) => [...prevChat, userMessage]); // Add user message to chat
    setLoading(true); // Set loading true when we send the message

    try {
      const res = await axios.post("http://127.0.0.1:8000/chat/", { message }, {
        headers: { "Content-Type": "application/json" },
      });

      if (!res.data.audioUrl) {  //Check if audio URL is present
        console.warn("No audio URL received from the backend.");
    } else {
        setAudioUrl(res.data.audioUrl);  //Set the audio URL state
    }
    

      // We first set the assistant's message as an empty string in chat
      const botMessage: Message = { role: "assistant", content: "" };
      setChat((prevChat) => [...prevChat, botMessage]);

      // Now simulate typing effect for the bot response
      const responseContent = res.data.response;
      let index = 0;

      setTyping(true); // Set typing animation to true

      const interval = setInterval(() => {
        setChat((prevChat) => {
          const updatedChat = [...prevChat];
          updatedChat[updatedChat.length - 1] = {
            ...updatedChat[updatedChat.length - 1],
            content: responseContent.substring(0, index + 1), // Reveal content progressively
          };
          return updatedChat;
        });

        index += 1;
        if (index === responseContent.length) {
          clearInterval(interval); // Stop typing animation when full message is shown
          setTyping(false); // Set typing to false when done
          setLoading(false); // End loading state
        }
      }, 25); // Typing speed (in ms per character)

    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }

    setMessage(""); // Clear user input after sending message
  };

  useEffect(() => {
    if (audioUrl && audioRef.current) {
        // Prepend the base URL to the audio path
        const fullAudioUrl = `http://127.0.0.1:8000${audioUrl}`;
        audioRef.current.src = fullAudioUrl;
        audioRef.current.load(); // Ensure the audio element loads the new source
        audioRef.current.play().catch((error) => {
            console.error("Error playing audio:", error);
        });
    }
}, [audioUrl]);


  return (
    <div className="max-w-lg mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Chatbot Version 0.0.1</CardTitle>
          <CardDescription>Functional Conversational Chatbot</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border p-3 h-60 overflow-y-auto">
            {chat.map((msg, index) => (
              <p key={index} className={`text-${msg.role === "user" ? "right" : "left"}`}>
                <strong>{msg.role === "user" ? "You" : "O"}:</strong> {msg.content}
              </p>
            ))}
            {loading && !typing && <p className="text-left"><strong>O:</strong> Typing...</p>}
          </div>
        </CardContent>
        <audio ref={audioRef} controls style={{ margin: "-10px 100px 10px auto" }} />  
        <CardFooter>
          <div className="grid w-full gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={loading}
            />
            <Button onClick={sendMessage} disabled={loading}>
              {loading ? "Sending..." : "Send"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
