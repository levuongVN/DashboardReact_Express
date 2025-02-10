import React, { useEffect, useRef, useState } from 'react';

const ChatComponent = () => {
    const [messages, setMessages] = useState([]); // Lưu tin nhắn
    const [input, setInput] = useState(''); // Nội dung nhập từ người dùng
    const ws = useRef(null); // Tham chiếu WebSocket

    // Kết nối WebSocket khi component được mount
    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:3001');

        ws.current.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        ws.current.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                setMessages((prev) => [...prev, message.content]); // Chỉ thêm nội dung tin nhắn
            } catch (e) {
                console.error('Error parsing message:', e);
            }
        };
        

        ws.current.onclose = () => {
            console.log('WebSocket disconnected');
        };

        return () => {
            ws.current.close(); // Đóng kết nối khi component bị unmount
        };
    }, []);

    // Xử lý gửi tin nhắn
    const sendMessage = () => {
        if (input && ws.current.readyState === WebSocket.OPEN) {
            const message = JSON.stringify({
                content: input,
            });
            ws.current.send(message); // Gửi dưới dạng JSON
            setInput(''); // Xóa nội dung input sau khi gửi
        }
    };
    

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }} className='bg-light'>
            <h1>WebSocket Chat</h1>
            <div
                style={{
                    border: '1px solid black',
                    padding: '10px',
                    height: '300px',
                    overflowY: 'scroll',
                    marginBottom: '10px',
                }}
            >
                {messages.map((msg, index) => (
                    <div key={index}>{msg}</div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                style={{ width: '80%', marginRight: '10px' }}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default ChatComponent;
