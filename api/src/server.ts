import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { SocketController } from './controllers/SocketController';
import { CardService } from './services/CardService';

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const httpServer = createServer(app);

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Initialize socket controller
new SocketController(io);

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get a full deck with all available cards (no duplicates)
app.get('/api/cards/full-deck', (req, res) => {
  try {
    const cardService = CardService.getInstance();
    const fullDeck = cardService.createFullDeck();
    res.json({ 
      success: true, 
      count: fullDeck.length,
      deck: fullDeck 
    });
  } catch (error) {
    console.error('Error getting full deck:', error);
    res.status(500).json({ 
      success: false, 
      error: (error as Error).message 
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 