import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { Send, MessageSquare, Users, Shield } from 'lucide-react';

const CommunicationPage: React.FC = () => {
  const { messages, sendMessage } = useChat();
  const { currentUser, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'leadership'>('general');
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const canSeeLeadership = hasPermission('communicate_with_director');

  const filteredMessages = useMemo(() => {
    return messages.filter(m => m.channel === activeTab);
  }, [messages, activeTab]);
  
  useEffect(() => {
    // If user cannot see leadership chat but it is the active tab, switch to general
    if (!canSeeLeadership && activeTab === 'leadership') {
      setActiveTab('general');
    }
  }, [canSeeLeadership, activeTab]);

  useEffect(() => {
    // Scroll to bottom on new message
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [filteredMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(activeTab, newMessage);
      setNewMessage('');
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3"><MessageSquare/> Communication Zone</h2>
      <p className="text-gray-500 mt-1">Coordinate with your team and supervisors.</p>

      <div className="mt-6 flex flex-col h-[70vh] bg-white rounded-lg shadow-md border">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 py-3 px-6 font-semibold text-sm ${activeTab === 'general' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500'}`}
          >
            <Users size={16} /> General
          </button>
          {canSeeLeadership && (
            <button
              onClick={() => setActiveTab('leadership')}
              className={`flex items-center gap-2 py-3 px-6 font-semibold text-sm ${activeTab === 'leadership' ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-gray-500'}`}
            >
              <Shield size={16} /> Leadership
            </button>
          )}
        </div>

        {/* Chat Messages */}
        <div ref={chatContainerRef} className="flex-1 p-6 space-y-4 overflow-y-auto">
          {filteredMessages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">No messages in this channel yet.</div>
          ) : (
            filteredMessages.map(msg => {
              const isCurrentUser = msg.senderId === currentUser?.id;
              return (
                <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md p-3 rounded-lg ${isCurrentUser ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-800'}`}>
                    {!isCurrentUser && <p className="text-xs font-bold mb-1 opacity-70">{msg.senderName}</p>}
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'} text-right`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-gray-50 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder={`Message in #${activeTab}`}
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-brand-accent outline-none"
            />
            <button type="submit" className="bg-brand-primary text-white p-3 rounded-full hover:bg-brand-dark transition-colors flex-shrink-0">
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommunicationPage;
