"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function Home() {
    const [message, setMessage] = useState("");
    const [chat, setChat] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [typing, setTyping] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const handleEmotion = (emotion: string) => {
        document.getElementById(`${emotion}Animation`)?.click();
    };

    const sendMessage = async () => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage) return;

        const userMessage: Message = { role: "user", content: message };
        setChat((prevChat) => [...prevChat, userMessage]);
        setLoading(true);
        setMessage("");

        try {
            const res = await axios.post("http://127.0.0.1:8000/chat/", { message: trimmedMessage }, {
                headers: { "Content-Type": "application/json" },
            });

            if (res.data?.audioUrl) {
                setAudioUrl(res.data.audioUrl);
            } else {
                console.warn("No audio URL received from the backend.");
            }

            if (res.data?.emotion) {
                handleEmotion(res.data.emotion);
            } else {
                console.warn("No emotion received from the backend.");
            }

            const responseContent = res.data?.response?.generator?.replies[0]?.content ?? "hi";
            setChat((prevChat) => [...prevChat, { role: "assistant", content: "" }]);
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

    useEffect(() => {
        import('./src/main.js')
            .then((module) => module.initializeWorld())
            .catch((error) => console.error("Error loading main.js:", error));
    }, []);

    return (
        <div style={{ overflowX: "hidden", overflowY: "hidden" }}>
            <div style={{ width: "100%", height: "100vh", position: "absolute", top: 0, left: 0, zIndex: -1 }}>
            <div id="scene-container" style={{ position: 'absolute', top: 0, left: 0 }}>
            </div>
            <div className="mx-auto p-6">

                <audio
                    ref={audioRef}
                    controls
                    className="m-auto"
                    style={{
                        width: "0",
                        height: "0",
                        opacity: 0,
                        position: "absolute",
                        top: "-9999px"
                    }}
                />
                <div style={{ position: 'fixed', bottom: '5%', left: 0, right: 0, width: '75%', height: 'auto', margin: 'auto', padding: '0 20px' }}>
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
                                <br />
                                <div className="flex gap-2 justify-center">
                                    
                                <Button id="neutralAnimation">Neutral</Button>
                                <Button id="surpriseAnimation">Surprise</Button>
                                <Button id="angerAnimation">Anger</Button>
                                <Button id="calmAnimation">Calm</Button>
                                <Button id="happyAnimation">Happy</Button>
                                <Button id="sadAnimation">Sad</Button>
                                <Button id="fearAnimation">Fear</Button>
                                <Button id="disgustAnimation">Disgust</Button>
                            </div>


                            </div>

                        </CardFooter>

                    </Card>
                </div>
            </div>
        </div>
        </div>
    );
}