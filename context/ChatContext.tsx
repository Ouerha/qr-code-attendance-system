import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import type { ChatMessage } from '../types';
import { useAuth } from './AuthContext';

interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (channel: 'general' | 'leadership', content: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { currentUser } = useAuth();

  const sendMessage = useCallback((channel: 'general' | 'leadership', content: string) => {
    if (!currentUser || !content.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      channel,
      content: content.trim(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
  }, [currentUser]);

  return (
    <ChatContext.Provider value={{ messages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
