import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import { Container } from './container';
import { createErrorHandler } from './middleware/errorHandler';
import { createApartmentRoutes } from './routes/apartmentRoutes';
import { createAuthRoutes } from './routes/authRoutes';
import { createCityRoutes } from './routes/cityRoutes';
import { createConversationRoutes } from './routes/conversationRoutes';

const container = new Container();

container.imageStorage.ensureBaseDir();
container.cityService.prewarm();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(container.imageStorage.uploadsDir));

app.use('/api/auth', createAuthRoutes(container.authController));
app.use(
  '/api/apartments',
  createApartmentRoutes(
    container.apartmentController,
    container.authMiddleware,
    container.uploadMiddleware,
  ),
);
app.use(
  '/api/conversations',
  createConversationRoutes(container.conversationController, container.authMiddleware),
);
app.use('/api/cities', createCityRoutes(container.cityController));

app.use(createErrorHandler(container.imageStorage));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
container.chatGateway.attach(io);

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`),
    );
  })
  .catch((err) => console.error('MongoDB connection error:', err));
