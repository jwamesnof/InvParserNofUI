# InvParser - Invoice Management Dashboard

A modern, production-quality Next.js frontend for an Invoice Parser API. Built as a SaaS-style invoice management dashboard with a focus on clean UX, professional design, and maintainable architecture.

## 🎯 Features

- **Authentication**: Dummy auth system (admin/admin) with localStorage persistence
- **Dashboard**: Overview cards, quick actions, recent uploads
- **File Upload**: Drag-and-drop invoice upload with file validation and progress tracking
- **Invoice Management**: List view with search/filtering by vendor
- **Invoice Details**: Full invoice display with line items, editable fields, and data summary
- **Responsive Design**: Mobile-first design that works on all screen sizes
- **Professional UI**: SaaS-style design with rounded corners, soft shadows, and smooth transitions

## 🏗️ Architecture

### Structure
```
src/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with auth provider
│   ├── page.tsx             # Root redirect
│   ├── login/               # Login page
│   ├── dashboard/           # Dashboard page
│   ├── upload/              # Invoice upload page
│   ├── invoices/            # Invoices list page
│   └── invoice/[id]/        # Invoice details page
├── components/              # React components
│   ├── ui/                  # Reusable UI components (Button, Input, Card, etc.)
│   ├── layout/              # Layout components (Navbar, Sidebar, MainLayout)
│   └── invoices/            # Domain-specific invoice components
├── hooks/                   # Custom React hooks
│   ├── useInvoices.ts       # Invoice data fetching hooks
│   └── useRequireAuth.ts    # Auth guard hook
├── lib/                     # Utilities and context
│   ├── api.ts               # Centralized API client
│   └── auth-context.tsx     # Auth provider and context
└── types/                   # TypeScript types and interfaces
```

### Key Principles

- **Separation of Concerns**: UI, API, state, and business logic are clearly separated
- **Reusable Components**: All UI components are composable and don't contain business logic
- **Centralized API**: All API calls go through `lib/api.ts` for easy debugging and modification
- **Type Safety**: Full TypeScript with strict mode enabled
- **Clean Architecture**: Easy to extend with new pages, components, or features

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Backend API running on `http://localhost:8082`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

- **Username**: admin
- **Password**: admin

### Build for Production

```bash
npm run build
npm start
```

## 📋 Pages Overview

### 1. **Login** (`/login`)
- Clean, centered login form
- Dummy authentication (admin/admin)
- Session stored in localStorage
- Automatic redirect to dashboard on success

### 2. **Dashboard** (`/dashboard`)
- Overview stats cards (total invoices, this month, pending, total amount)
- Quick action buttons
- Recent uploads list
- Protected route (requires authentication)

### 3. **Upload** (`/upload`)
- Drag-and-drop file upload
- File type and size validation (PDF, JPG, PNG; max 10MB)
- Upload progress indicator
- Mock extraction response redirect
- Success/error toast notifications

### 4. **Invoices** (`/invoices`)
- Table view of all invoices
- Search/filter by vendor name
- Clickable rows to view details
- Mock data for demo
- Empty state handling

### 5. **Invoice Details** (`/invoice/[id]`)
- Full invoice information display
- Line items table
- Edit mode for vendor and invoice details
- Summary card with totals and tax breakdown
- Mock data for demo

## 🎨 Design System

### Colors
- **Primary**: `#2563eb` (Blue)
- **Secondary**: `#64748b` (Slate)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Destructive**: `#ef4444` (Red)

### Components

#### UI Components (`src/components/ui/`)
- `Button`: Primary, secondary, destructive, ghost variants
- `Input`: Text input with labels, error states, helper text
- `Card`: Container with header, body, footer sections
- `Table`: Responsive table with header, body, rows, cells
- `Badge`: Status badges with multiple variants
- `Skeleton`: Loading skeletons for content placeholders

#### Layout Components
- `Navbar`: Top navigation with logout
- `MainLayout`: Sidebar navigation with protected content area

#### Domain Components
- `FileUploader`: Drag-and-drop file upload widget
- `InvoiceTable`: Invoice list table
- `LineItemsTable`: Invoice line items display

## 🔌 API Integration

All API calls are centralized in `src/lib/api.ts`. The API client is configured to use the backend at `http://localhost:8082`.

### Available Endpoints (from backend)

- `POST /extract` - Upload and extract invoice
- `GET /invoice/{invoice_id}` - Get invoice details
- `GET /invoices/vendor/{vendor_name}` - Search invoices by vendor

### Mock Data

For demo purposes, the app includes mock data in the list and detail pages. Replace with real API calls when backend is available.

## 🛠️ Technologies

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **Validation**: Zod (installed, ready to use)

## 📦 Project Setup

### Configuration Files

- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS customization
- `tsconfig.json` - TypeScript configuration
- `.env.local` - Environment variables

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8082
```

## 🎯 Next Steps

### To Connect to Real Backend

1. Update API calls in `src/lib/api.ts` as needed
2. Remove mock data from pages
3. Replace mock invoice data with real API calls
4. Implement pagination/infinite scroll in `/invoices`
5. Add invoice editing/deletion endpoints

### To Extend

- Add more fields to invoice details
- Implement invoice export (PDF, CSV)
- Add bulk operations
- Create invoice templates
- Add user settings/preferences
- Implement role-based access control

## 📝 Code Quality

- **TypeScript**: Strict mode enabled for type safety
- **Linting**: ESLint configured
- **Formatting**: Consistent code style
- **Components**: Fully typed with proper React.FC patterns
- **Hooks**: Custom hooks with proper dependency management

## 🚀 Deployment

This project is ready to deploy to Vercel, Netlify, or any Node.js hosting platform.

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

A Dockerfile can be created for containerized deployment.

## 📄 License

MIT

---

Built with ❤️ by a Senior Frontend Engineer
