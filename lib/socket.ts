import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";

interface Message {
  id: string;
  senderId: string;
  senderRole: string; // 'COMPANY' or 'ADMIN'
  senderName: string;
  content: string;
  timestamp: Date;
  roomId: string; // Support ticket ID
}

class SocketManager {
  private io: SocketIOServer | null = null;
  private activeRooms: Map<string, Set<string>> = new Map(); // roomId -> Set of userIds

  initialize(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL?.split(",") || ["http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.io.on("connection", (socket) => {
      console.log(`User connected: ${socket.id}`);
      
      // Join a support room
      socket.on("join-support-room", (data: { roomId: string; userId: string; userRole: string; userName: string }) => {
        socket.join(data.roomId);
        
        // Track active users in room
        if (!this.activeRooms.has(data.roomId)) {
          this.activeRooms.set(data.roomId, new Set());
        }
        this.activeRooms.get(data.roomId)?.add(data.userId);
        
        // Notify others in the room about new user
        socket.to(data.roomId).emit("user-joined", {
          userId: data.userId,
          userRole: data.userRole,
          userName: data.userName,
          timestamp: new Date()
        });
      });

      // Handle new message
      socket.on("send-message", (data: Message) => {
        // Validate message data
        if (!data.roomId || !data.content) {
          return;
        }
        
        // Broadcast message to room
        socket.to(data.roomId).emit("receive-message", data);
        
        // Emit notification event to all connected clients for real-time notification updates
        if (this.io) {
          this.io.emit("new-message-notification", {
            roomId: data.roomId,
            senderRole: data.senderRole,
            timestamp: data.timestamp
          });
          
          // Emit specific notification events for admin and company users
          if (data.senderRole === 'ADMIN') {
            // Notify company users
            this.io.emit("company-unread-update", {
              roomId: data.roomId,
              increment: true
            });
          } else if (data.senderRole === 'COMPANY') {
            // Notify admin users
            this.io.emit("admin-unread-update", {
              roomId: data.roomId,
              increment: true
            });
          }
        }
      });

      // Handle typing indicator
      socket.on("typing", (data: { roomId: string; userId: string; userName: string; isTyping: boolean }) => {
        socket.to(data.roomId).emit("user-typing", data);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });
  }

  // Send message to specific room
  sendMessageToRoom(roomId: string, message: Message) {
    if (this.io) {
      this.io.to(roomId).emit("receive-message", message);
    }
  }

  // Get active users in a room
  getActiveUsersInRoom(roomId: string): string[] {
    const users = this.activeRooms.get(roomId);
    return users ? Array.from(users) : [];
  }
  
  // Emit notification to all clients
  emitNotification(event: string, data: any) {
    if (this.io) {
      this.io.emit(event, data);
    }
  }
}

export default new SocketManager();