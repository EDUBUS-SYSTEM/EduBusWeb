# 🚌 EduBus - School Bus Management System

A comprehensive school bus management and transportation system built with Next.js. EduBus provides real-time tracking, safety monitoring, and efficient management of school transportation services.

## ✨ Key Features

- 🚌 **Real-time Bus Tracking**: Monitor bus locations and arrival times in real-time
- 🛡️ **Safety Management**: Professional drivers, regular vehicle maintenance, and safety protocols
- 📱 **User-Friendly Interface**: Intuitive design with automatic notifications
- 🎯 **Comprehensive Services**: Daily transportation, on-demand rides, and group bookings
- 🏫 **School Solutions**: Complete bus management for educational institutions
- 🔐 **Secure Authentication**: JWT-based authentication with role-based access

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4 with Soft UI design system
- **HTTP Client**: Axios with request/response interceptors
- **Authentication**: JWT token management with refresh tokens
- **State Management**: React Context API
- **UI Components**: Custom components with Soft UI design principles

## 📁 Project Structure

```
my-app/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css     # Global styles with Soft UI
│   │   ├── layout.tsx      # Root layout with AuthProvider
│   │   └── page.tsx        # Login page (main entry)
│   ├── components/         # Reusable components
│   │   ├── layout/         # Header, Footer components
│   │   └── ui/            # Button, Card, Input, Modal
│   ├── hooks/             # Custom React hooks
│   │   └── useAuth.tsx    # Authentication context
│   ├── lib/               # Utility libraries
│   │   └── api.ts         # API client configuration
│   └── types/             # TypeScript definitions
├── public/                # Static assets
└── package.json           # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NEXT_PUBLIC_APP_NAME=EduBus
   NEXT_PUBLIC_APP_DESCRIPTION=School Bus Management System
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to: `http://localhost:3000`

## 🎨 Design System

### Color Palette
- **Primary**: Neon Blue (`#3b82f6` to `#1d4ed8`)
- **Background**: Soft white and blue gradients
- **Accent**: Light blue (`#dbeafe`)
- **Text**: Dark gray (`#374151`)

### Design Principles
- **Soft UI**: Large border radius (24px), gentle shadows
- **Gradients**: Pastel gradients for buttons and backgrounds
- **Animations**: Smooth transitions and hover effects
- **Typography**: Clean and readable fonts (Geist Sans)

### Responsive Design
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔐 Authentication System

The application implements a comprehensive authentication system:

- **JWT Token Management**: Secure token storage and automatic refresh
- **Role-based Access**: Admin, User, and Moderator roles
- **Auto-logout**: Automatic logout on token expiration
- **Protected Routes**: Route protection based on authentication status

### Authentication Flow
1. User submits login credentials
2. Server validates and returns JWT tokens
3. Tokens stored in localStorage
4. Automatic token injection in API requests
5. Token refresh on expiration

## 📋 API Integration

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user information

### Response Format
```typescript
{
  success: boolean;
  data: any;
  message?: string;
  errors?: string[];
}
```

### API Client Features
- **Automatic Token Injection**: JWT tokens automatically added to requests
- **Error Handling**: Centralized error handling with 401 auto-logout
- **Request/Response Interceptors**: Custom interceptors for consistent behavior
- **Timeout Configuration**: 10-second request timeout

## 🧩 Component Library

### UI Components
- **Button**: Multiple variants (primary, secondary, outline, ghost, danger)
- **Card**: Content containers with flexible padding and shadow options
- **Input**: Form inputs with validation and icon support
- **Modal**: Popup dialogs with backdrop blur and smooth animations

### Layout Components
- **Header**: Navigation with user menu and mobile responsiveness
- **Footer**: Multi-column layout with company information and links

## 🔧 Development Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Configuration
Ensure proper environment variables are set for production:
- `NEXT_PUBLIC_API_URL` - Production API endpoint
- `NEXT_PUBLIC_JWT_SECRET` - Secure JWT secret key
