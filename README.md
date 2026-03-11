# Real Estate Management System Backend

The **Real Estate Management System Backend** is a robust, multi-tenant API built with Node.js, Express, and MongoDB. It is designed to help property managers, landlords, and organizations streamline their day-to-day operations.

## Features

- **Multi-Tenancy & Security:** Securely isolates data using `organizationId` filters, ensuring that each property management company can only access its own properties, units, tenants, and financial data. Features Role-Based Access Control (RBAC) with Landlord, Manager, and Tenant roles.
- **Property & Unit Management:** Allows for the creation and tracking of physical properties and individual units. Tracks unit occupancy status (vacant vs. occupied) automatically as tenants move in and out.
- **Tenant Lifecycles:** Stores tenant information, links them to specific units, tracks their rent balances, and logs their payment histories.
- **Automated Rent Payments:** Integrates with M-Pesa's STK Push API to initiate rent payments directly to a tenant's phone and processes automated callbacks to mark rent statuses as 'paid'.
- **Maintenance Ticketing:** Tenants can submit maintenance requests through a dedicated portal, and managers can update the progress securely through the dashboard API.
- **Reporting & Analytics:** Generates dynamic financial and property reports (PDFs) and provides analytical endpoints for occupancy rates, revenue tracking, and late payment monitoring.

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Security:** Helmet, CORS, Express Rate Limit
- **Testing:** Jest, Supertest
- **Utilities:** PDFKit, json2csv/plainjs, Luxon

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB connection string (e.g., MongoDB Atlas)

### Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   cd Realestate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the environment variables. Rename `.env.example` to `.env` (or create a `.env` file) and fill in the necessary values:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=<your-mongodb-connection-string>
   JWT_SECRET=<your-very-strong-jwt-secret>
   JWT_EXPIRE=30d
   
   # Add your M-Pesa configuration details here if applicable
   MPESA_CONSUMER_KEY=...
   MPESA_CONSUMER_SECRET=...
   MPESA_PASSKEY=...
   ```

### Running the Server

**Development Mode (with Nodemon):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

## Running Tests
The project features a comprehensive suite of unit and integration tests.

To run tests once:
```bash
npm run test
```

To run tests in watch mode (ideal during development):
```bash
npm run test:watch
```

## API Structure

The API exposes the following main resource endpoints:
- **Authentication:** `/api/auth` (Register, Login, Me)
- **Organizations:** `/api/organizations` (Multi-tenant structure)
- **Properties:** `/api/properties` (Manage properties)
- **Units:** `/api/units` and `/api/properties/:propertyId/units` (Manage units)
- **Tenants:** `/api/tenants` (Manage leases and rent status)
- **Tenant Portal:** `/api/tenant-portal` (Restricted views for tenants)
- **Payments:** `/api/payments` (Processing rent inputs and M-Pesa integration)
- **Maintenance:** `/api/maintenance` (Creation and lifecycle of maintenance requests)
- **Analytics:** `/api/analytics` (Manager dashboards)
- **Reports:** `/api/reports` (Downloadable billing and activity statements)

## Error Handling & Reliability

The API utilizes a custom `AppError` class and centralized middleware for consistent JSON responses. The application also handles `unhandledRejection`, `SIGTERM`, and `SIGINT` events to gracefully close the database connection upon termination.
