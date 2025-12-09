'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TicketMessage {
  id: number;
  content: string;
  senderId: number;
  senderRole: string;
  ticketId: number;
  createdAt: Date;
  sender?: {
    name: string;
  };
}

interface Ticket {
  id: number;
  title: string;
  content: string;
  status: string;
  priority: string;
  companyId: number;
  adminId: number | null;
  createdAt: Date;
  updatedAt: Date;
  messages?: TicketMessage[];
}

interface Message {
  id: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

export default function SupportPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketContent, setTicketContent] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Initialize socket connection
  useEffect(() => {
    // Connect to Socket.IO server with correct path
    const newSocket = io({ path: '/socket.io/' });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('receive-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
      // Scroll to bottom when new message arrives
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    });

    newSocket.on('user-typing', (data: { isTyping: boolean }) => {
      setIsTyping(data.isTyping);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Reset unread count when visiting support page
  useEffect(() => {
    const resetUnreadCount = async () => {
      try {
        await fetch('/api/support/unread-count', { method: 'POST' });
      } catch (error) {
        // Silently fail as this is not critical
      }
    };
    
    resetUnreadCount();
  }, []);

  // Fetch tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('/api/company/support/tickets');
        const data = await response.json();
        setTickets(data.tickets);
        setLoading(false);
        
        // If there are tickets, show the ticket list instead of create form
        if (data.tickets && data.tickets.length > 0) {
          setShowCreateForm(false);
        }
        
        // Join all support rooms for all tickets
        if (socket && data.tickets) {
          data.tickets.forEach((ticket: Ticket) => {
            socket.emit('join-support-room', {
              roomId: ticket.id.toString(),
              userId: 'company-user-id',
              userRole: 'COMPANY',
              userName: 'Şirket Temsilcisi',
            });
          });
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setLoading(false);
      }
    };

    fetchTickets();
  }, [socket]);

  // Fetch messages for a specific ticket
  const fetchTicketMessages = async (ticketId: number) => {
    // Since messages are already included in the ticket data from the GET endpoint,
    // we don't need to make a separate API call. 
    // Just find the ticket in our existing tickets array and use its messages.
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket && ticket.messages) {
      setMessages(ticket.messages.map((msg: TicketMessage) => ({
        id: msg.id.toString(),
        senderId: msg.senderId.toString(),
        senderRole: msg.senderRole,
        senderName: msg.sender?.name || 'Bilinmeyen Kullanıcı',
        content: msg.content,
        timestamp: new Date(msg.createdAt),
      })));
    } else {
      setMessages([]);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Select a ticket
  const selectTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setTicketId(ticket.id);
    setShowCreateForm(false);
    
    // Set messages for this ticket
    if (ticket.messages) {
      setMessages(ticket.messages.map((msg: TicketMessage) => ({
        id: msg.id.toString(),
        senderId: msg.senderId.toString(),
        senderRole: msg.senderRole,
        senderName: msg.sender?.name || 'Bilinmeyen Kullanıcı',
        content: msg.content,
        timestamp: new Date(msg.createdAt),
      })));
    } else {
      setMessages([]);
    }
    
    // No need to join the room here since we already joined all rooms when loading
  };

  // Create a new support ticket
  const createTicket = async () => {
    if (!ticketTitle.trim() || !ticketContent.trim()) return;

    try {
      const response = await fetch('/api/company/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: ticketTitle,
          content: ticketContent,
        }),
      });

      const result = await response.json();
      if (result.success) {
        const newTicketData = result.ticket;
        const newTicket: Ticket = {
          id: newTicketData.id,
          title: newTicketData.title,
          content: newTicketData.content,
          status: newTicketData.status,
          priority: newTicketData.priority,
          companyId: newTicketData.companyId,
          adminId: newTicketData.adminId,
          createdAt: new Date(newTicketData.createdAt),
          updatedAt: new Date(newTicketData.updatedAt),
          messages: []
        };
        
        setTickets([...tickets, newTicket]);
        setSelectedTicket(newTicket);
        setTicketId(newTicket.id);
        
        setMessages([
          {
            id: Date.now().toString(),
            senderId: 'system',
            senderRole: 'SYSTEM',
            senderName: 'Sistem',
            content: `Destek talebiniz oluşturuldu: ${newTicket.title}`,
            timestamp: new Date(),
          },
          {
            id: (Date.now() + 1).toString(),
            senderId: 'user',
            senderRole: 'COMPANY',
            senderName: 'Şirket Temsilcisi',
            content: ticketContent,
            timestamp: new Date(),
          }
        ]);
        setShowCreateForm(false);
        
        // No need to join the room here since we already joined all rooms when loading
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !socket || !ticketId) return;

    try {
      // Save message to database
      const response = await fetch('/api/support/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          ticketId: ticketId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        const message: Message = {
          id: result.message.id,
          senderId: result.message.senderId,
          senderRole: result.message.senderRole,
          senderName: result.message.senderName,
          content: result.message.content,
          timestamp: result.message.timestamp,
        };

        // Emit message through socket
        socket.emit('send-message', {
          ...message,
          roomId: ticketId.toString(),
        });

        setMessages(prev => [...prev, message]);
        setNewMessage('');

        // Stop typing indicator
        socket.emit('typing', {
          roomId: ticketId.toString(),
          userId: 'company-user-id',
          userName: 'Şirket Temsilcisi',
          isTyping: false,
        });
        
        // Focus back to textarea
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        }, 10);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (socket && ticketId) {
      socket.emit('typing', {
        roomId: ticketId.toString(),
        userId: 'company-user-id',
        userName: 'Şirket Temsilcisi',
        isTyping: true,
      });

      // Clear typing indicator after delay
      setTimeout(() => {
        socket.emit('typing', {
          roomId: ticketId.toString(),
          userId: 'company-user-id',
          userName: 'Şirket Temsilcisi',
          isTyping: false,
        });
      }, 1000);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Açık</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">İşlemde</span>;
      case 'RESOLVED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Çözüldü</span>;
      case 'CLOSED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Kapandı</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 py-8">
      <div className="container px-4 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Destek Talepleri</h1>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {isConnected ? 'Çevrimiçi' : 'Çevrimdışı'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-250px)]">
            {/* Tickets Sidebar */}
            {tickets.length > 0 && (
              <div className="w-full lg:w-1/3 border-r border-gray-200 bg-gray-50">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900">Destek Taleplerim</h2>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                  {tickets.map((ticket) => (
                    <div 
                      key={ticket.id}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${
                        selectedTicket?.id === ticket.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
                      }`}
                      onClick={() => selectTicket(ticket)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{ticket.title}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            {getStatusBadge(ticket.status)}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="p-4">
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                      Yeni Talep Oluştur
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className={`flex-1 ${tickets.length > 0 ? 'lg:w-2/3' : 'w-full'}`}>
              {showCreateForm || tickets.length === 0 ? (
                // Create Ticket Form
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Yeni Destek Talebi Oluştur</h2>
                    <p className="text-gray-600">Destek ekibimiz size yardımcı olmak için burada.</p>
                  </div>

                  <div className="space-y-5 flex-1">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Konu
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={ticketTitle}
                        onChange={(e) => setTicketTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                        placeholder="Destek talebinizin konusu nedir?"
                      />
                    </div>

                    <div className="flex-1 flex flex-col">
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                        Açıklama
                      </label>
                      <textarea
                        id="content"
                        value={ticketContent}
                        onChange={(e) => setTicketContent(e.target.value)}
                        rows={8}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none shadow-sm"
                        placeholder="Lütfen sorununuzu detaylı olarak açıklayın..."
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
                    >
                      İptal
                    </button>
                    <button
                      onClick={createTicket}
                      disabled={!ticketTitle.trim() || !ticketContent.trim()}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Destek Talebi Oluştur
                    </button>
                  </div>
                </div>
              ) : (
                // Chat Interface
                <>
                  {selectedTicket ? (
                    <>
                      {/* Chat Header */}
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900">{selectedTicket.title}</h2>
                            <div className="flex items-center gap-3 mt-1">
                              {getStatusBadge(selectedTicket.status)}
                              <span className="text-xs text-gray-500">
                                {new Date(selectedTicket.createdAt).toLocaleString('tr-TR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Messages Area - Fixed height with scroll */}
                      <div 
                        ref={messagesContainerRef}
                        className="flex-1 overflow-y-auto p-6 bg-gray-50/50"
                        style={{ maxHeight: 'calc(100vh - 380px)' }}
                      >
                        <div className="space-y-5">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.senderRole === 'COMPANY' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 ${
                                  message.senderRole === 'COMPANY'
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : message.senderRole === 'ADMIN'
                                    ? 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
                                    : 'bg-gray-200 text-gray-800 rounded-br-none'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-semibold">
                                    {message.senderName}
                                  </span>
                                  {message.senderRole !== 'COMPANY' && (
                                    <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                                      {message.senderRole === 'ADMIN' ? 'Destek' : 'Sistem'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <div
                                  className={`text-xs mt-1 ${
                                    message.senderRole === 'COMPANY' ? 'text-indigo-200' : 'text-gray-500'
                                  }`}
                                >
                                  {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}

                          {isTyping && (
                            <div className="flex justify-start">
                              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div ref={messagesEndRef} />
                        </div>
                      </div>

                      {/* Message Input */}
                      <div className="border-t border-gray-200 p-4 bg-white">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <textarea
                              ref={textareaRef}
                              value={newMessage}
                              onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                              }}
                              onKeyDown={handleKeyPress}
                              placeholder="Mesajınızı yazın..."
                              rows={2}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none shadow-sm"
                            />
                          </div>
                          <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                            className="self-end h-12 w-12 flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                      <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Destek Talebi Seçin</h3>
                      <p className="text-gray-600 max-w-md">
                        Sol taraftan bir destek talebi seçin veya yeni bir talep oluşturun.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}