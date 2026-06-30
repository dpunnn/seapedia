import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/error.middleware';

import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import reviewRoutes from './routes/review.routes';
import sellerRoutes from './routes/seller.routes';
import buyerRoutes from './routes/buyer.routes';
import driverRoutes from './routes/driver.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
const swaggerDoc = {
  openapi: '3.0.0',
  info: { title: 'SEAPEDIA API', version: '1.0.0', description: 'SEAPEDIA Marketplace API - COMPFEST 18' },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
};
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;
