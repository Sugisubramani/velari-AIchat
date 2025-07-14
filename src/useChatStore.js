import { useState, useEffect } from 'react';

const STORAGE_KEY = 'velari_chats';

export default function useChatStore() {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setChats(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse localStorage chats:', e);
        setChats([]);
      }
    }
  }, []);

  const saveChats = (updated) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setChats(updated);
  };

  const fetchChats = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  };

  const newChat = (firstMessage = '') => {
    const id = crypto.randomUUID();
    const title = firstMessage
      ? firstMessage.length > 30
        ? firstMessage.slice(0, 30) + '…'
        : firstMessage
      : 'Untitled';

    const newChat = {
      id,
      title,
      createdAt: Date.now(),
      messages: [], // ✅ Don't prefill message to avoid duplication
    };

    const updatedChats = [newChat, ...fetchChats()];
    saveChats(updatedChats);
    return id;
  };

  const appendMessage = (chatId, message) => {
    const existing = fetchChats();
    const updated = existing.map(chat => {
      if (chat.id !== chatId) return chat;
      return {
        ...chat,
        messages: [...chat.messages, message],
      };
    });
    saveChats(updated);
  };

  const updateChatMessages = (chatId, newMessages) => {
    const existing = fetchChats();
    const updated = existing.map(chat => {
      if (chat.id !== chatId) return chat;
      return { ...chat, messages: newMessages };
    });
    saveChats(updated);
  };

  const updateChatTitle = (chatId, newTitle) => {
    const existing = fetchChats();
    const updated = existing.map(chat => {
      if (chat.id !== chatId) return chat;
      return { ...chat, title: newTitle };
    });
    saveChats(updated);
  };

  const renameChat = (chatId, newTitle) => {
    if (!newTitle.trim()) return;
    updateChatTitle(chatId, newTitle.trim());
  };

  const getMessages = (chatId) => {
    const found = fetchChats().find(chat => chat.id === chatId);
    return found?.messages || [];
  };

  const deleteChat = (chatId) => {
    const existing = fetchChats();
    const updated = existing.filter(chat => chat.id !== chatId);
    saveChats(updated);
  };

  return {
    user: null,
    chats,
    newChat,
    appendMessage,
    getMessages,
    updateChatMessages,
    updateChatTitle,
    deleteChat,
    renameChat,
  };
}
  