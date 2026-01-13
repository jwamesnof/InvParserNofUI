# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- Backend API running on http://localhost:8082

## Setup & Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will be available at **http://localhost:3000**

### 3. Login
- **Username**: admin
- **Password**: admin

## Project Features

### ✅ Completed
- ✓ Login page with dummy auth
- ✓ Protected routes & navigation
- ✓ Dashboard with overview cards
- ✓ File upload with drag-and-drop
- ✓ Invoices list with search
- ✓ Invoice details page
- ✓ Responsive design
- ✓ Professional UI/UX
- ✓ Type-safe TypeScript
- ✓ Reusable components

### 🔧 Architecture Highlights

**Clean Separation of Concerns**
- `src/components/ui/` - Reusable UI components
- `src/components/layout/` - Layout components
- `src/components/invoices/` - Domain-specific components
- `src/hooks/` - Custom React hooks
- `src/lib/api.ts` - Centralized API client
- `src/lib/auth-context.tsx` - Authentication context
- `src/types/` - TypeScript types

**Pages**
- `/` - Root redirect
- `/login` - Authentication
- `/dashboard` - Overview
- `/upload` - Upload invoices
- `/invoices` - List invoices
- `/invoice/[id]` - Invoice details

## API Integration

All API calls use `src/lib/api.ts`. The backend API should be running at:
```
http://localhost:8082
```

### Available Endpoints
- `POST /extract` - Upload invoice
- `GET /invoice/{id}` - Get invoice details
- `GET /invoices/vendor/{vendor}` - Search by vendor

## Development Tips

### Add a New Page
1. Create file in `src/app/your-page/page.tsx`
2. Use `MainLayout` wrapper for protected pages
3. Add route to sidebar in `src/components/layout/MainLayout.tsx`

### Add a New Component
1. Create component in appropriate folder under `src/components/`
2. Keep components focused and reusable
3. Pass data via props, avoid business logic in components

### Update API Calls
1. Edit `src/lib/api.ts`
2. Export functions for use in hooks
3. Use custom hooks (`useInvoices`, `useExtractInvoice`) from pages

## Building for Production

```bash
npm run build
npm start
```

Or deploy to Vercel:
```bash
vercel
```

## Troubleshooting

**App shows blank screen?**
- Make sure auth context is properly initialized
- Check browser console for errors

**API calls failing?**
- Verify backend is running on http://localhost:8082
- Check .env.local has correct API URL

**Build errors?**
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript errors: `npm run lint`

---

Ready to develop! 🎉
