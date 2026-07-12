import { ApartmentController } from './controllers/ApartmentController';
import { AuthController } from './controllers/AuthController';
import { CityController } from './controllers/CityController';
import { ConversationController } from './controllers/ConversationController';
import { createAuthMiddleware } from './middleware/authMiddleware';
import { createUploadMiddleware } from './middleware/upload';
import { MongoApartmentRepository } from './repositories/mongo/MongoApartmentRepository';
import { MongoConversationRepository } from './repositories/mongo/MongoConversationRepository';
import { MongoMessageRepository } from './repositories/mongo/MongoMessageRepository';
import { MongoUserRepository } from './repositories/mongo/MongoUserRepository';
import { ApartmentService } from './services/ApartmentService';
import { AuthService } from './services/AuthService';
import { ChatService } from './services/ChatService';
import { CityService } from './services/CityService';
import { ChatGateway } from './sockets/ChatGateway';
import { LocalDiskImageStorage } from './storage/LocalDiskImageStorage';

/**
 * Manual DI: repositories → services → controllers/gateway.
 * Everything is a singleton; construct after dotenv has loaded.
 */
export class Container {
  // Repositories & storage
  readonly userRepository = new MongoUserRepository();
  readonly apartmentRepository = new MongoApartmentRepository();
  readonly conversationRepository = new MongoConversationRepository();
  readonly messageRepository = new MongoMessageRepository();
  readonly imageStorage = new LocalDiskImageStorage();

  // Services
  readonly authService = new AuthService(this.userRepository);
  readonly apartmentService = new ApartmentService(
    this.apartmentRepository,
    this.imageStorage,
  );
  readonly chatService = new ChatService(
    this.conversationRepository,
    this.messageRepository,
    this.apartmentRepository,
  );
  readonly cityService = new CityService();

  // Controllers & gateway
  readonly authController = new AuthController(this.authService);
  readonly apartmentController = new ApartmentController(this.apartmentService);
  readonly conversationController = new ConversationController(this.chatService);
  readonly cityController = new CityController(this.cityService);
  readonly chatGateway = new ChatGateway(this.authService, this.chatService);

  // Middleware bound to services/storage
  readonly authMiddleware = createAuthMiddleware(this.authService);
  readonly uploadMiddleware = createUploadMiddleware(this.imageStorage);
}
