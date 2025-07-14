import { useState, useRef, useEffect } from 'react';
import { getChatResponse } from './api/chatRouter';
import Sidebar from './Sidebar';
import ProfileMenu from './ProfileMenu';
import useChatStore from './useChatStore';

function App() {
  const [input, setInput] = useState('');
  const [displayedChat, setDisplayedChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  const {
    chats,
    newChat,
    appendMessage,
    getMessages,
    updateChatMessages,
    updateChatTitle,
    deleteChat,
  } = useChatStore();

  const [activeChatId, setActiveChatId] = useState(null);

  // Rehydrate chat session
  useEffect(() => {
    const storedId = localStorage.getItem('velari_active_chat');
    if (storedId) setActiveChatId(storedId);
  }, []);

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem('velari_active_chat', activeChatId);
    } else {
      localStorage.removeItem('velari_active_chat');
    }
  }, [activeChatId]);

  useEffect(() => {
    if (activeChatId) {
      const msgs = getMessages(activeChatId);
      setDisplayedChat(msgs);
    } else {
      setDisplayedChat([]);
    }
  }, [activeChatId, chats]);

  const handleNewChat = () => {
    const id = newChat();
    setActiveChatId(id);
    setInput('');
    setDisplayedChat([]);
  };

  const handleLoadChat = (id) => {
    setActiveChatId(id);
  };

  const handleDeleteChat = (id) => {
    deleteChat(id);
    if (activeChatId === id) {
      setActiveChatId(null);
      setDisplayedChat([]);
    }
  };

  const handleRenameChat = (id, newTitle) => {
    updateChatTitle(id, newTitle);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    let chatId = activeChatId;

    if (!chatId) {
      chatId = newChat(input);
      setActiveChatId(chatId);
    } else if (getMessages(chatId).length === 0) {
      const newTitle = input.length > 30 ? input.slice(0, 30) + '…' : input;
      updateChatTitle(chatId, newTitle);
    }

    const userMsg = { role: 'user', content: input };
    const placeholder = { role: 'ai', content: '...' };

    appendMessage(chatId, userMsg);
    appendMessage(chatId, placeholder);

    setInput('');
    setLoading(true);

    try {
      const ai = await getChatResponse(input);
      const msgs = getMessages(chatId).slice(0, -1);
      const final = [...msgs, { role: 'ai', content: ai }];
      updateChatMessages(chatId, final);
      setDisplayedChat(final);
    } catch {
      const failed = getMessages(chatId).slice(0, -1);
      failed.push({ role: 'ai', content: '⚠️ Error, try again.' });
      updateChatMessages(chatId, failed);
      setDisplayedChat(failed);
    }

    setLoading(false);
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const last = displayedChat[displayedChat.length - 1];
    if (!last || last.role !== 'ai') return;

    let i = 0;
    const words = last.content.split(' ');
    const interval = setInterval(() => {
      i++;
      const partial = words.slice(0, i).join(' ');
      const updated = [...displayedChat];
      updated[updated.length - 1] = { role: 'ai', content: partial };
      setDisplayedChat([...updated]);
      if (i >= words.length) clearInterval(interval);
    }, 50);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [displayedChat]);

  return (
    <div className="d-flex min-vh-100 bg-black text-white" style={{ fontFamily: 'system-ui,sans-serif' }}>
      <Sidebar
        onNewChat={handleNewChat}
        onLoadChat={handleLoadChat}
        chatList={chats}
        activeChatId={activeChatId}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
      />
      <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
        <div style={{ width: '100%', maxWidth: '720px' }}>
          <div className="d-flex justify-content-between mb-4">
            <h1 style={{ color: '#eaeaea' }}>Velari</h1>
            <ProfileMenu />
          </div>
          <div
            ref={chatRef}
            className="p-4 mb-4"
            style={{
              height: '65vh',
              overflowY: 'auto',
              background: '#111',
              borderRadius: '16px',
              border: '1px solid #333',
            }}
          >
            {displayedChat.map((m, i) => (
              <div
                key={i}
                className={`d-flex mb-3 ${m.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div
                  style={{
                    background: m.role === 'user' ? '#007bff' : '#2a2a2a',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    maxWidth: '80%',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  <strong>{m.role === 'user' ? 'You' : 'Velari'}</strong>
                  <div>{m.content === '...' ? <TypingDots /> : m.content}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="input-group">
            <textarea
              className="form-control"
              placeholder="Ask Velari anything…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              style={{
                resize: 'none',
                background: '#1c1c1c',
                color: '#fff',
                border: '1px solid #333',
              }}
            />
            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={!input.trim() || loading}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prev => (prev % 3) + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <span>{'.'.repeat(dotCount)}</span>;
}

export default App;
