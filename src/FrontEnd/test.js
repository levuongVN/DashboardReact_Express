import { useEffect, useState } from "react";

const WebSocketClient = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const [input, setInput] = useState("");
  const [toUser, setToUser] = useState("");

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001");

    socket.onopen = () => {
      console.log(`User ${userId} connected`);
      socket.send(JSON.stringify({ type: "register", userId }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, `${data.from}: ${data.content}`]);
    };

    socket.onclose = () => {
      console.log(`User ${userId} disconnected`);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [userId]);

  const sendMessage = () => {
    if (ws && input.trim() && toUser.trim()) {
      ws.send(JSON.stringify({ type: "message", to: toUser, content: input }));
      setMessages((prev) => [...prev, `You -> ${toUser}: ${input}`]);
      setInput("");
    }
  };

  return (
    <div style={{ border: "1px solid black", padding: "10px", width: "300px" }}>
      <h3>Chat - User {userId}</h3>
      <input
        type="text"
        placeholder="Enter recipient ID"
        value={toUser}
        onChange={(e) => setToUser(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="Enter message"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
    </div>
  );
};

export default WebSocketClient;
