import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import routes
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import feedRoutes from './routes/feed.routes';
import cardsRoutes from './routes/cards.routes';
import icebreakersRoutes from './routes/icebreakers.routes';
import matchRoutes from './routes/match.routes';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/feed', feedRoutes);
app.use('/api/v1/cards', cardsRoutes);
app.use('/api/v1/icebreakers', icebreakersRoutes);
app.use('/api/v1/matches', matchRoutes);


// Health check endpoint
app.get("/", (req, res) => {
  res.send("DeepMatch API is alive!");
});

// Basic error handling (optional but good practice)
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


app.listen(port, () => {
  console.log(`[DeepMatch API] Server running at http://localhost:${port}`);
});
