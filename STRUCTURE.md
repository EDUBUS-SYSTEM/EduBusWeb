
Next.js Frontend

## 🏗️ Project Structure Overview

```
my-app/
├── 📁 src/                          # Main source code
│   ├── 📁 app/                      # Next.js App Router (v13+)
│   │   ├── 📁 login/               # Login page
│   │   ├── 📁 register/            # Registration page
│   │   ├── 📄 globals.css          # Global CSS with Soft UI
│   │   ├── 📄 layout.tsx           # Main application layout
│   │   └── 📄 page.tsx             # Home page
│   ├── 📁 components/              # Reusable components
│   │   ├── 📁 layout/              # Layout components
│   │   │   ├── 📄 Header.tsx       # Header with navigation
│   │   │   └── 📄 Footer.tsx       # Footer
│   │   └── 📁 ui/                  # Basic UI components
│   │       ├── 📄 Button.tsx       # Button component
│   │       ├── 📄 Card.tsx         # Card component
│   │       ├── 📄 Input.tsx        # Input component
│   │       └── 📄 Modal.tsx        # Modal component
│   ├── 📁 hooks/                   # Custom React hooks
│   │   └── 📄 useAuth.ts           # Authentication hook
│   ├── 📁 lib/                     # Utility libraries
│   │   └── 📄 api.ts              # API client configuration
│   └── 📁 types/                   # TypeScript type definitions
│       └── 📄 index.ts             # Global types
├── 📄 .env                         # Environment variables (local)
├── 📄 .env.example                 # Environment variables template
├── 📄 package.json                 # Dependencies and scripts
├── 📄 tsconfig.json               # TypeScript configuration
├── 📄 README.md                   # Documentation
└── 📄 STRUCTURE.md                # This file - Project structure
```

---

## 📂 Detailed Directory and File Structure

### 🎯 **src/app/** - Next.js App Router

#### 📄 **layout.tsx**
- **Function**: Main layout for the entire application
- **Content**:
  - Wrap entire app with `AuthProvider`
  - Import and render `Header` and `Footer`
  - Configure metadata (title, description)
  - Set up fonts and background gradient
- **Features**: 
  - Uses Next.js 13+ App Router
  - Responsive design with Tailwind CSS
  - Soft UI with gradient background

#### 📄 **page.tsx**
- **Function**: Website home page
- **Content**:
  - Hero section with call-to-action
  - Features section (3 cards)
  - Categories section (4 categories)
  - CTA section at bottom of page
- **Features**:
  - Soft UI design with neon blue theme
  - Responsive grid layout
  - Hover animations and transitions

#### 📄 **globals.css**
- **Function**: Global CSS for the application
- **Content**:
  - Tailwind CSS imports
  - CSS variables for color scheme
  - Custom animations (fade-in, zoom-in, slide-in)
  - Soft UI styles (shadows, gradients)
  - Custom scrollbar styling
- **Features**:
  - Uses Tailwind CSS v4
  - Custom CSS variables for theming
  - Glass morphism effects

#### 📁 **login/page.tsx**
- **Function**: Login page
- **Content**:
  - Login form with email/password
  - Form validation
  - Error handling
  - Link to registration page
- **Features**:
  - Soft UI design
  - Real-time validation
  - Loading states
  - Responsive design

#### 📁 **register/page.tsx**
- **Function**: User registration page
- **Content**:
  - Registration form with name/email/password/confirm
  - Form validation
  - Terms & conditions checkbox
  - Link to login page
- **Features**:
  - Comprehensive validation
  - Password confirmation
  - Terms agreement
  - Error handling

---

### 🧩 **src/components/** - Reusable Components

#### 📁 **layout/Header.tsx**
- **Function**: Website header navigation
- **Content**:
  - Logo and brand name
  - Navigation menu (Desktop)
  - User menu with dropdown
  - Mobile menu toggle
  - Login/Register buttons
- **Features**:
  - Responsive design
  - User authentication state
  - Dropdown menu
  - Mobile hamburger menu

#### 📁 **layout/Footer.tsx**
- **Function**: Website footer
- **Content**:
  - Company information
  - Quick links
  - Contact information
  - Social media links
  - Copyright notice
- **Features**:
  - 4-column grid layout
  - Social media icons
  - Contact details
  - Legal links

#### 📁 **ui/Button.tsx**
- **Function**: Reusable button component
- **Props**:
  - `variant`: primary, secondary, outline, ghost, danger
  - `size`: sm, md, lg
  - `loading`: boolean
  - `disabled`: boolean
- **Features**:
  - Soft UI design with gradients
  - Hover animations
  - Loading spinner
  - Multiple variants

#### 📁 **ui/Card.tsx**
- **Function**: Card component for content containers
- **Props**:
  - `title`: optional title
  - `shadow`: sm, md, lg
  - `padding`: sm, md, lg
- **Features**:
  - Rounded corners (border-radius: 24px)
  - Hover effects
  - Gradient title text
  - Flexible padding options

#### 📁 **ui/Input.tsx**
- **Function**: Input component with validation
- **Props**:
  - `label`: input label
  - `error`: error message
  - `leftIcon`, `rightIcon`: optional icons
  - `helperText`: helper text
- **Features**:
  - Error states
  - Icon support
  - Validation feedback
  - Soft UI styling

#### 📁 **ui/Modal.tsx**
- **Function**: Modal component for popups
- **Props**:
  - `isOpen`: boolean
  - `onClose`: function
  - `size`: sm, md, lg, xl
- **Features**:
  - Backdrop blur
  - Escape key support
  - Smooth animations
  - Multiple sizes

---

### 🎣 **src/hooks/** - Custom React Hooks

#### 📄 **useAuth.ts**
- **Function**: Authentication context and hook
- **Content**:
  - `AuthProvider`: Context provider
  - `useAuth`: Custom hook
  - User state management
  - Login/Register/Logout functions
- **Features**:
  - JWT token management
  - Auto-logout on token expiry
  - Persistent authentication
  - Error handling

---

### 🔧 **src/lib/** - Utility Libraries

#### 📄 **api.ts**
- **Function**: API client configuration
- **Content**:
  - Axios instance setup
  - Request/Response interceptors
  - Error handling
  - Helper functions (get, post, put, delete, patch)
- **Features**:
  - Automatic token injection
  - 401 error handling
  - Timeout configuration
  - Base URL configuration

---

### 📝 **src/types/** - TypeScript Definitions

#### 📄 **index.ts**
- **Function**: Global TypeScript interfaces
- **Content**:
  - User types
  - Auth types (LoginCredentials, RegisterCredentials)
  - API response types
  - UI component prop types
  - Form field types
- **Features**:
  - Comprehensive type safety
  - Reusable interfaces
  - API contract definitions

---

## 🔧 **Configuration Files**

### 📄 **package.json**
- **Function**: Project dependencies and scripts
- **Main Dependencies**:
  - `next`: 15.4.6
  - `react`: 19.1.0
  - `axios`: ^1.6.0
  - `typescript`: ^5
  - `tailwindcss`: ^4
- **Scripts**:
  - `dev`: Development server
  - `build`: Production build
  - `start`: Production server
  - `lint`: Code linting

### 📄 **tsconfig.json**
- **Function**: TypeScript configuration
- **Features**:
  - Path mapping (`@/*` → `./src/*`)
  - Strict mode enabled
  - Next.js integration
  - Modern ES features

### 📄 **.env.local**
- **Function**: Environment variables
- **Variables**:
  - `NEXT_PUBLIC_API_URL`: Backend API URL
  - `NEXT_PUBLIC_JWT_SECRET`: JWT secret key
  - `NEXT_PUBLIC_APP_NAME`: App name
  - `NEXT_PUBLIC_APP_DESCRIPTION`: App description

---

## 🎨 **Design System**

### **Color Scheme**
- **Primary**: Neon Blue (`#3b82f6` to `#1d4ed8`)
- **Background**: Soft white and blue gradients
- **Text**: Dark gray (`#374151`)
- **Accent**: Light blue (`#dbeafe`)

### **Design Principles**
- **Soft UI**: Large border radius, gentle shadows
- **Gradients**: Pastel gradients for buttons and backgrounds
- **Animations**: Smooth transitions and hover effects
- **Typography**: Clean and readable fonts

### **Responsive Breakpoints**
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

---

## 🚀 **Development Workflow**

### **1. Setup**
```bash
cd my-app
npm install
```

### **2. Environment Setup**
Create `.env.local` file with necessary environment variables

### **3. Development**
```bash
npm run dev
```

### **4. Build**
```bash
npm run build
npm start
```

---

## 📋 **API Endpoints Required**

### **Authentication**
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get user information

### **Response Format**
```typescript
{
  success: boolean;
  data: any;
  message?: string;
  errors?: string[];
}
```

---

## 🔒 **Security Features**

- **JWT Token Management**: Automatic token injection
- **Error Handling**: 401 auto-logout
- **Form Validation**: Client-side validation
- **Environment Variables**: Secure configuration
- **Type Safety**: TypeScript throughout

---

## 📱 **Features Implemented**

- ✅ **Authentication System**: Login/Register with validation
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Soft UI Design**: Modern, friendly interface
- ✅ **Type Safety**: Full TypeScript support
- ✅ **API Integration**: Axios client with interceptors
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Loading States**: User feedback during operations
- ✅ **Form Validation**: Real-time validation
- ✅ **Navigation**: Header with user menu
- ✅ **SEO Ready**: Meta tags and structured data

---

## 🎯 **Next Steps**

### **Can be extended with:**
- Product listing page
- Shopping cart functionality
- User profile management
- Admin dashboard
- Payment integration
- Search functionality
- Filter and sorting
- Wishlist feature
- Order management
- Review system

---

*This structure is designed to be easily extensible and maintainable. Each component has clear responsibilities and can be reused.*


