import React, { useState, useEffect } from "react";

const Chat = () => {
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { sender: "user", text: input }]);

    try {
      const response = await fetch("http://localhost:5678/webhook-test/6aba24aa-a30b-49c5-906b-9890809ebfc1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (data && data.output) {
        setMessages(prev => [...prev, { sender: "bot", text: data.output }]);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }

    setInput("");
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:5678/other-webhook-path", {
        method: "GET",
      });
      const data = await response.json();

      if (data && data.output) {
        setMessages(prev => [...prev, { sender: "bot", text: data.output }]);
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen p-6 bg-gray-100">
      <div className="flex-1 overflow-y-auto mb-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none'
              } shadow-md`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-4">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-full p-4 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Digite sua mensagem..."
        />
        <button
          onClick={sendMessage}
          className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default Chat;
