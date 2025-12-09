const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO directly in server.js for now
  const { Server } = require('socket.io');
  
  // Get allowed origins from environment or use default
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ["http://localhost:3000"];
  
  const io = new Server(server, {
    cors: {
      // In development, allow all origins for tunnel testing (ngrok, localtunnel, etc.)
      // In production, use specific allowed origins from environment
      origin: dev ? true : allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // Join a support room
    socket.on('join-support-room', (data) => {
      socket.join(data.roomId);
      
      // Notify others in the room about new user
      socket.to(data.roomId).emit('user-joined', {
        userId: data.userId,
        userRole: data.userRole,
        userName: data.userName,
        timestamp: new Date()
      });
    });

    // Handle new message
    socket.on('send-message', (data) => {
      // Validate message data
      if (!data.roomId || !data.content) {
        return;
      }
      
      // Broadcast message to room
      socket.to(data.roomId).emit('receive-message', data);
      
      // Emit notification event to all connected clients for real-time notification updates
      io.emit("new-message-notification", {
        roomId: data.roomId,
        senderRole: data.senderRole,
        timestamp: data.timestamp
      });
      
      // Emit specific notification events for admin and company users
      if (data.senderRole === 'ADMIN') {
        // Notify company users
        io.emit("company-unread-update", {
          roomId: data.roomId,
          increment: true
        });
      } else if (data.senderRole === 'COMPANY') {
        // Notify admin users
        io.emit("admin-unread-update", {
          roomId: data.roomId,
          increment: true
        });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      socket.to(data.roomId).emit('user-typing', data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || '0.0.0.0'; // Bind to all interfaces for external access
  
  server.listen(PORT, HOST, (err) => {
    if (err) throw err;
    const localUrl = `http://localhost:${PORT}`;
    const networkUrl = `http://${getLocalIPAddress()}:${PORT}`;
    console.log(`> Ready on ${localUrl}`);
    console.log(`> Network access: ${networkUrl}`);
    console.log(`> For external access, use ngrok or localtunnel (see scripts in package.json)`);
  });
  
  // Helper function to get local IP address
  function getLocalIPAddress() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
    return 'localhost';
  }

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });
});