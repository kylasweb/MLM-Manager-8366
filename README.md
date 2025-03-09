# MLM Manager - Integration with Contentful, Auth0, and MongoDB Atlas

This system integrates Contentful, Auth0, and MongoDB Atlas with an MLM (Multi-Level Marketing) management system deployed on Netlify. The integration is built using Netlify Functions (serverless) to handle the backend logic.

## Core Components

1. **Auth0 Integration**
   - Authentication middleware for API routes
   - Role-based access control
   - User profile management

2. **MongoDB Atlas Integration**
   - User data storage
   - MLM structure (downline/upline)
   - Commission calculation and tracking
   - Transaction history

3. **Contentful Integration**
   - Content management for marketing materials
   - Localized content for different regions
   - Dynamic site content configuration

## Getting Started

### Prerequisites

- Node.js 14+ installed
- Netlify CLI installed (`npm install -g netlify-cli`)
- Auth0 account
- MongoDB Atlas account
- Contentful account

### Installation

1. Clone the repository:
   ```
   git clone [repository-url]
   cd mlm-manager
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` with your credentials:
   ```
   cp .env.example .env
   ```

4. Configure your external services:
   - Set up Auth0 application and API
   - Create MongoDB Atlas cluster and database
   - Set up Contentful space with appropriate content models

5. Start the development server:
   ```
   npm run dev
   ```

## API Structure

The MLM Manager API is organized into several modules:

- `/api/users` - User management and MLM structure
- `/api/commissions` - Commission management and calculations
- `/api/content` - Contentful content management

Each API module has appropriate authentication and authorization checks.

## Authentication

The system uses Auth0 for authentication:

1. Client-side authentication using Auth0 React SDK
2. Backend authentication using JWT verification
3. Role-based access control for different user types (admin, member, etc.)

## Commission Structure

The MLM commission system supports:

1. Direct commissions for sales
2. Multi-level (downline) commissions
3. Configurable commission rates and levels
4. Commission payment tracking

## Content Management

The Contentful integration provides:

1. Dynamic content for the MLM platform
2. Marketing materials that can be easily updated
3. Localization support for multiple languages
4. Admin interface for content management

## Deployment

The application is designed to be deployed on Netlify:

1. Push your changes to a Git repository
2. Connect repository to Netlify
3. Configure environment variables in Netlify dashboard
4. Deploy the application

## Security Considerations

- All API routes are protected with JWT authentication
- Role-based access control for sensitive operations
- Sensitive data is not exposed to the frontend
- Environment variables for all sensitive credentials

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request 