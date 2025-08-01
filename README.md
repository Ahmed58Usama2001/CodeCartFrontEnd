# CodeCart Frontend

A modern, responsive e-commerce frontend application built with Angular, featuring elegant UI components and real-time functionality.

## 🚀 Features

- **Product Showcase**: Elegant product display with advanced filtering and sorting
- **Smart Search**: Real-time product search by name
- **Shopping Cart**: Interactive cart with real-time updates
- **Secure Checkout**: Stripe integration with address and payment management
- **Order Management**: Complete order history and detailed order tracking
- **Real-time Updates**: SignalR integration for live payment status updates
- **Admin Panel**: Administrative interface for order management and refunds
- **Authentication**: Secure user registration, login, and session management
- **Responsive Design**: Mobile-first approach with Bootstrap and Angular Material

## 🛠️ Technology Stack

- **Angular** - Frontend framework
- **TypeScript** - Type-safe JavaScript
- **Angular Material** - UI component library
- **Bootstrap** - CSS framework
- **SignalR** - Real-time communication
- **RxJS** - Reactive programming
- **Azure Blue Theme** - Custom Material Design theme

## 🏗️ Project Structure

```
src/
├── app/
│   ├── Core/
│   │   ├── interceptors/     # HTTP interceptors
│   │   └── services/         # Core services
│   ├── Features/
│   │   ├── account/          # Authentication features
│   │   ├── admin/            # Admin panel
│   │   ├── cart/             # Shopping cart
│   │   ├── checkout/         # Checkout process
│   │   ├── home/             # Home page
│   │   ├── orders/           # Order management
│   │   ├── shop/             # Product showcase
│   │   └── test-error/       # Error testing
│   ├── Layout/               # Layout components
│   ├── Shared/
│   │   ├── components/       # Reusable components
│   │   ├── directives/       # Custom directives
│   │   ├── models/           # TypeScript interfaces
│   │   └── pipes/            # Custom pipes
│   └── environments/         # Environment configurations
```

## 🎨 Design Features

- **Azure Blue Theme** - Custom Material Design theme
- **Responsive Layout** - Mobile-first design approach
- **Interactive Components** - Smooth animations and transitions
- **Intuitive Navigation** - User-friendly interface design
- **Loading States** - Visual feedback for async operations
- **Error Handling** - Elegant error display and recovery

## 🔧 Core Features

### Product Management
- Advanced filtering by brands and categories
- Multiple sorting options (alphabetical, price)
- Real-time search functionality
- Detailed product views with image galleries

### Shopping Cart
- Anonymous cart support
- Persistent cart after user registration
- Real-time quantity updates
- Cart persistence across sessions

### Checkout Process
- Multi-step checkout flow
- Address management
- Stripe payment integration
- Order confirmation and tracking

### Authentication & Security
- JWT token management
- Route guards for protected areas
- Role-based access control
- Secure session handling

## 🛡️ Security & Guards

### Route Guards
- **AuthGuard** - Protects authenticated routes
- **AdminGuard** - Restricts admin-only areas
- **OrderCompleteGuard** - Secures order completion flow

### Interceptors
- **TokenInterceptor** - Automatic token attachment
- **ErrorInterceptor** - Global error handling
- **LoadingInterceptor** - Loading state management

## 🔄 Real-time Features

SignalR integration for:
- Live payment status updates
- Real-time order notifications
- Dynamic cart synchronization

## 📱 Custom Components

### Pipes
- **AddressPipe** - Format shipping addresses
- **PaymentPipe** - Extract payment details from Stripe tokens

### Services
- **CartService** - Cart state management
- **OrderService** - Order processing
- **AccountService** - User authentication
- **AdminService** - Administrative functions


## 🔄 State Management

- **Services** - Singleton services for state management
- **BehaviorSubjects** - Reactive state updates
- **Local Storage** - Persistent cart and user preferences
- **Session Management** - Secure token storage

## 📱 Responsive Design

- **Mobile First** - Optimized for mobile devices
- **Breakpoint System** - Bootstrap responsive grid
- **Touch Friendly** - Mobile-optimized interactions
- **Progressive Web App** - PWA-ready architecture

## 🎨 Theming

Custom Azure Blue theme with:
- Primary: Azure Blue palette
- Typography: Material Design typography
- Custom CSS variables for consistent styling
- Angular Material team for beautiful components
- Bootstrap team for responsive utilities
- SignalR team for real-time capabilities
