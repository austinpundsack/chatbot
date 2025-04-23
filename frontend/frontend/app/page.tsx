"use client";

import dynamic from 'next/dynamic'; 
import { useState, useEffect, useRef } from "react";
import axios from "axios";
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
import { Badge } from "@/components/ui/badge";

interface Message {
  role: "user" | "assistant";
  content: string;
}


export default function Home() {
  // // Dynamically import Avatar3D with ssr: false (to prevent server-side rendering)
  // const Avatar3D = dynamic(() => import('../components/Avatar3D'), { ssr: false });
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [typing, setTyping] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [previousProgress, setPreviousProgress] = useState<number>(0);
  const [transitionStyle, setTransitionStyle] = useState<string>("0.01s ease-out");
  const [svgWidth, setSvgWidth] = useState<number>(0); // Track the SVG width
  const svgRef = useRef<SVGSVGElement>(null);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = { role: "user", content: message };
    setChat((prevChat) => [...prevChat, userMessage]);
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/chat/", { message }, {
        headers: { "Content-Type": "application/json" },
      });

      if (!res.data.audioUrl) {
        console.warn("No audio URL received from the backend.");
      } else {
        setAudioUrl(res.data.audioUrl);
      }
      if (!res.data.emotion) {
        console.warn("No emotion received from the backend.");
      } else {
        setEmotion(res.data.emotion);

        if (res.data.emotion === "neutral") {
          document.getElementById("neutralAnimation")?.click();
        } else if (res.data.emotion === "surprise") {
          document.getElementById("surpriseAnimation")?.click();
        } else if (res.data.emotion === "anger") {
          document.getElementById("angerAnimation")?.click();
        }
      }

      const botMessage: Message = { role: "assistant", content: "" };
      setChat((prevChat) => [...prevChat, botMessage]);

      const responseContent = res.data.response?.generator?.replies[0]?.content ?? "hi";
      let index = 0;
      setTyping(true);

      const interval = setInterval(() => {
        setChat((prevChat) => {
          const updatedChat = [...prevChat];
          updatedChat[updatedChat.length - 1] = {
            ...updatedChat[updatedChat.length - 1],
            content: responseContent.substring(0, index + 1),
          };
          return updatedChat;
        });

        index += 1;
        if (index === responseContent.length) {
          clearInterval(interval);
          setTyping(false);
          setLoading(false);
        }
      }, 25);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }

    setMessage("");
  };

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      const fullAudioUrl = `http://127.0.0.1:8000${audioUrl}`;
      audioRef.current.src = fullAudioUrl;
      audioRef.current.load();
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  }, [audioUrl]);

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      const rawProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      const clampedProgress = Math.min(Math.max(rawProgress, 0), 100);

      const newTransitionStyle = clampedProgress > audioProgress ? "0.5s ease-out" : "0.2s ease-out";
      setTransitionStyle(newTransitionStyle);

      setAudioProgress(clampedProgress);
    }
  };

  useEffect(() => {
    setPreviousProgress(audioProgress);
  }, [audioProgress]);

  const width = 430; // Width of the rectangle
  const height = 240; // Height of the rectangle
  const perimeter = 2 * (width + height); // Perimeter for a rectangle
  const strokeDashoffset = audioRef.current && audioRef.current.duration
    ? perimeter - (audioProgress / 100) * perimeter
    : perimeter;

  const isAudioPlaying = audioProgress > 0;


  // const togglePlayPause = () => {
  //   if (audioRef.current) {
  //     if (audioRef.current.paused) {
  //       audioRef.current.play().catch((error) => {
  //         console.error("Error playing audio:", error);
  //       });
  //     } else {
  //       audioRef.current.pause();
  //     }
  //   }
  // };

  // const toggleMuteUnmute = () => {
  //   if (audioRef.current) {
  //     // Toggle mute state
  //     audioRef.current.muted = !audioRef.current.muted;
  //   }
  // };

  useEffect(() => {
    loadAvatar()
  }, []); // Empty dependency array ensures this runs once when the component mounts

  async function loadAvatar() {
        // Dynamically import the main.js from src directory
        import('./src/main.js').then((module) => {
          // Initialize the world after the module is loaded
          module.initializeWorld();
        }).catch((error) => {
          console.error("Error loading main.js:", error);
        });
  }

  return (
    
    <div style={{ overflowX: "hidden", overflowY: "hidden"}}>
      <div id="scene-container" style={{position: 'absolute', top: 0, left: 0}}>
      </div>
    <div className="mx-auto p-6">   
      <CardHeader className="relative">

  <CardTitle>Chatbot Version 1.0.0</CardTitle>
  <CardDescription>Functional Conversational Chatbot</CardDescription>
  <div className="absolute top-4 right-8 flex gap-2">
  <Button id="neutralAnimation">Neutral</Button>
  <Button id="surpriseAnimation">Surprise</Button>
  <Button id="angerAnimation">Anger</Button>
  {/* <Button id="bird-switch-button">Switch Bird</Button> */}

        {/* <Button
          onClick={togglePlayPause}
          className={audioRef.current?.paused ? "" : "bg-red-500 text-white"}
        >
          {audioRef.current?.paused ? "Play" : "Pause"}
        </Button>
        <Button
          onClick={toggleMuteUnmute}
          className={audioRef.current?.muted ? "bg-red-500 text-white" : ""}
        >
          {audioRef.current?.muted || audioRef.current?.paused ? "Unmute" : "Mute"}
        </Button> */}
{/* <Button
  onClick={loadAvatar}
>
  Load Avatar
</Button> */}
{/* <Button
          id="play"
        >
          Pause
        </Button> */}
       {/*  <Button
          id="control"
        >
          Move Control
        </Button>
                {/* <Button
          id="hide"
        >
          Hide
        </Button> */}
  </div>
  {/* <div>
      <Avatar3D />
    </div> */}
</CardHeader>

          {/* <div style={{position: 'fixed', bottom: '5%', left: 0, right: 0, width: '75%', height: 'auto', margin: 'auto', padding: '0 20px'}}>
            <svg
              width="450"
              height="260"
              viewBox="0 0 450 260"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="10"
                y="10"
                width={width}
                height={height}
                stroke="#ddd"
                strokeWidth="10"
                fill="none"
              />
              <rect
                x="10"
                y="10"
                width={width}
                height={height}
                stroke={isAudioPlaying ? "#007bff" : "#ddd"}
                strokeWidth="10"
                fill="none"
                strokeDasharray={perimeter}
                strokeDashoffset={strokeDashoffset}
                style={{
                  transition: `stroke-dashoffset ${transitionStyle}`,
                }}
              />
            </svg>
          </div> */}

        <CardContent className="flex flex-col">
          <div className="p-8 h-60 overflow-y-auto">
            {chat.map((msg, index) => (
              <p key={index} className={`text-${msg.role === "user" ? "right" : "left"}`}>
                <strong>{msg.role === "user" ? "You" : "O"}:</strong> {msg.content}
              </p>
            ))}
            {loading && !typing && <p className="text-left"><strong>O:</strong> Typing...</p>}
          </div>
        </CardContent>
        <audio
          ref={audioRef}
          controls
          onTimeUpdate={handleTimeUpdate}
          className="m-auto"
          style={{
            width: "0",
            height: "0",
            opacity: 0,
            position: "absolute",
            top: "-9999px"
          }}
        />
        <div style={{position: 'fixed', bottom: '5%', left: 0, right: 0, width: '75%', height: 'auto', margin: 'auto', padding: '0 20px'}}>
        <Card>
        <CardFooter>
          <div className="grid w-full p-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={loading}
            />
            <br />
            <Button onClick={sendMessage} disabled={loading}>
              {loading ? "Sending..." : "Send"}
            </Button>
          </div>
        </CardFooter>
      </Card>
      </div>
    </div>
    </div>
  );
}
