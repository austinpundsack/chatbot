"use client";

import axios from "axios";
import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = { role: "user", content: message };
    setChat([...chat, userMessage]);
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/chat/", { message },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Response from backend:", res.data); // Debugging
      
      const botMessage: Message = { role: "assistant", content: res.data.response };
      setChat((prevChat) => [...prevChat, botMessage]);
    } catch (error) {
      console.error("Error:", error);
    }

    setLoading(false);
    setMessage("");
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-bold">Chatbot</h2>
      <div className="border p-3 h-96 overflow-y-auto">
        {chat.map((msg, index) => (
          <p key={index} className={`text-${msg.role === "user" ? "right" : "left"}`}>
            <strong>{msg.role === "user" ? "You" : "Bot"}:</strong> {msg.content}
          </p>
        ))}
        {loading && <p className="text-left"><strong>Bot:</strong> Typing...</p>}
      </div>
      <div className="flex mt-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border p-2"
          disabled={loading}
        />
        <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white p-2 rounded" disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}