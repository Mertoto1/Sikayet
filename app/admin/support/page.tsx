'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Link from 'next/link';

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
  company: {
    name: string;
  };
}

interface Message {
  id: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

interface SocketMessage extends Message {
  roomId?: string;
}

export default function AdminSupportPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

    newSocket.on('receive-message', (message: SocketMessage) => {
      // Check if this message belongs to the selected ticket
      if (selectedTicket && message.roomId === selectedTicket.id.toString()) {
        // Remove roomId before adding to messages state
        const { roomId, ...messageWithoutRoomId } = message;
        setMessages(prev => [...prev, messageWithoutRoomId]);
        // Scroll to bottom when new message arrives
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
      
      // Update the tickets list to show that there's a new message
      // This will help with notification badges
      setTickets(prevTickets => 
        prevTickets.map(ticket => {
          if (ticket.id.toString() === message.roomId) {
            // We could update the ticket to show it has unread messages
            // For now, we'll just return the ticket as is
            return ticket;
          }
          return ticket;
        })
      );
    });

    newSocket.on('user-typing', (data: { isTyping: boolean }) => {
      setIsTyping(data.isTyping);
    });

    return () => {
      newSocket.close();
    };
  }, [selectedTicket]);

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
        const response = await fetch('/api/admin/support/tickets');
        const data = await response.json();
        setTickets(data.tickets);
        setLoading(false);
        
        // Join all support rooms for all tickets
        if (socket && data.tickets) {
          data.tickets.forEach((ticket: Ticket) => {
            socket.emit('join-support-room', {
              roomId: ticket.id.toString(),
              userId: 'admin-user-id',
              userRole: 'ADMIN',
              userName: 'Destek Ekibi',
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
    
    // Fetch messages for this ticket
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticket.id}/messages`);
      const data = await response.json();
      setMessages(data.messages);
      
      // Mark ticket as read
      try {
        await fetch('/api/support/mark-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ticketId: ticket.id }),
        });
      } catch (error) {
        console.error('Error marking ticket as read:', error);
      }
      
      // Notify server that admin has read messages in this ticket
      if (socket) {
        socket.emit('admin-read-messages', {
          roomId: ticket.id.toString(),
          userId: 'admin-user-id',
          userRole: 'ADMIN',
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
    
    // No need to join the room here since we already joined all rooms when loading
  };

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !socket || !selectedTicket) return;

    try {
      // Save message to database
      const response = await fetch('/api/support/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          ticketId: selectedTicket.id,
        }),
      });

      const result = await response.json();
      if (result.success) {
        const message: SocketMessage = {
          id: result.message.id,
          senderId: result.message.senderId,
          senderRole: result.message.senderRole,
          senderName: result.message.senderName,
          content: result.message.content,
          timestamp: result.message.timestamp,
          roomId: selectedTicket.id.toString(),
        };

        // Emit message through socket
        socket.emit('send-message', {
          ...message,
          roomId: selectedTicket.id.toString(),
        });

        // Remove roomId before adding to messages state
        const { roomId, ...messageWithoutRoomId } = message;
        setMessages(prev => [...prev, messageWithoutRoomId]);
        setNewMessage('');

        // Stop typing indicator
        socket.emit('typing', {
          roomId: selectedTicket.id.toString(),
          userId: 'admin-user-id',
          userName: 'Destek Ekibi',
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
    if (socket && selectedTicket) {
      socket.emit('typing', {
        roomId: selectedTicket.id.toString(),
        userId: 'admin-user-id',
        userName: 'Destek Ekibi',
        isTyping: true,
      });

      // Clear typing indicator after delay
      setTimeout(() => {
        socket.emit('typing', {
          roomId: selectedTicket.id.toString(),
          userId: 'admin-user-id',
          userName: 'Destek Ekibi',
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

  // Update ticket status
  const updateTicketStatus = async (ticketId: number, status: string) => {
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (data.success) {
        // Update ticket in state
        setTickets(tickets.map(ticket => 
          ticket.id === ticketId ? { ...ticket, status: data.ticket.status } : ticket
        ));
        
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: data.ticket.status });
        }
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
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

  // Priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Yüksek</span>;
      case 'MEDIUM':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Orta</span>;
      case 'LOW':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Düşük</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{priority}</span>;
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
            <div className="w-full lg:w-1/3 border-r border-gray-200 bg-gray-50">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Tüm Destek Talepleri</h2>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                    <p className="mt-2 text-gray-600">Yükleniyor...</p>
                  </div>
                ) : (
                  <>
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
                            <p className="text-xs text-gray-500 mt-1 truncate">{ticket.company.name}</p>
                            <div className="flex items-center gap-2 mt-2">
                              {getStatusBadge(ticket.status)}
                              {getPriorityBadge(ticket.priority)}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(ticket.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {tickets.length === 0 && (
                      <div className="p-12 text-center">
                        <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Henüz destek talebi yok</h3>
                        <p className="text-gray-500">Şirketlerden gelen destek talepleri burada görünecek.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:w-2/3">
              {selectedTicket ? (
                <>
                  {/* Chat Header */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{selectedTicket.title}</h2>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">{selectedTicket.company.name}</span>
                          {getStatusBadge(selectedTicket.status)}
                          {getPriorityBadge(selectedTicket.priority)}
                          <span className="text-xs text-gray-500">
                            {new Date(selectedTicket.createdAt).toLocaleString('tr-TR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={selectedTicket.status}
                          onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="OPEN">Açık</option>
                          <option value="IN_PROGRESS">İşlemde</option>
                          <option value="RESOLVED">Çözüldü</option>
                          <option value="CLOSED">Kapandı</option>
                        </select>
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
                          className={`flex ${message.senderRole === 'ADMIN' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 ${
                              message.senderRole === 'ADMIN'
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-white border border-gray-200 rounded-bl-none shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold">
                                {message.senderName}
                              </span>
                              {message.senderRole !== 'ADMIN' && (
                                <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
                                  {message.senderRole === 'COMPANY' ? 'Şirket' : 'Sistem'}
                                </span>
                              )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <div
                              className={`text-xs mt-1 ${
                                message.senderRole === 'ADMIN' ? 'text-indigo-200' : 'text-gray-500'
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
                  <div className="mx-auto w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Destek Talebi Seçin</h3>
                  <p className="text-gray-600 max-w-md mb-6">
                    Sol taraftan bir destek talebi seçerek şirketle gerçek zamanlı olarak iletişim kurabilirsiniz.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Talep Seçimi</h4>
                      <p className="text-sm text-gray-600">Sol panelden bir destek talebi seçin</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Mesajlaşma</h4>
                      <p className="text-sm text-gray-600">Şirket temsilcisiyle gerçek zamanlı iletişim</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">Durum Yönetimi</h4>
                      <p className="text-sm text-gray-600">Talep durumunu güncelleyin ve kapatın</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}