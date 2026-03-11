import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import unitRoutes from './routes/unitRoutes.js';
import tenantRoutes from './routes/tenantRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import maintenanceRoutes from './routes/maintainanceRoutes.js';

// Load env vars
dotenv.config();

const app = express();

// Body parser
app.use(express.json());

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Support nested units route: /api/properties/:propertyId/units
app.use('/api/properties/:propertyId/units', unitRoutes);

// Error handler middleware
app.use(errorHandler);

export default app;
