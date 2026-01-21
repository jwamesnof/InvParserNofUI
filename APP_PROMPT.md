# Build a Next.js Invoice Parser Frontend

## Project Overview

Build a modern, production-quality Next.js application that serves as a frontend for an Invoice Parser API.
The application should allow users to upload invoice documents, extract invoice details, and view them in a clean,
intuitive, and professional interface.

Treat this project as a real SaaS-style product and a portfolio-level application, not a simple demo.

---

## API Endpoint

The backend API is available at:
http://localhost:8080

The API is responsible for processing invoices, extracting structured data, and storing invoice records.
The frontend should focus on:
- Uploading invoice files
- Displaying extracted invoice data clearly
- Managing loading, success, and error states
- Navigating invoices efficiently

### Available Endpoints

- POST /extract  
  Upload an invoice file (multipart/form-data) and extract invoice details

- GET /invoice/{invoice_id}  
  Retrieve details of a specific invoice by InvoiceId

- GET /invoices/vendor/{vendor_name}  
  Retrieve invoices filtered by vendor name

---

## Technical Requirements

### Framework & Setup

- Use Next.js with the App Router
- Use TypeScript for type safety
- Use Tailwind CSS for styling
- Use a UI component library (e.g. shadcn/ui, Radix UI, or similar)

---

## Pages & Navigation (Multi-Page Application)

### 1. Login Page (/login)
- Simple login form with username and password
- Dummy authentication:
  - username: admin
  - password: admin
- Store authentication state in localStorage or session storage
- Redirect to /dashboard on success
- Protect all other routes
- No real backend authentication required

---

### 2. Dashboard (/dashboard)
- Overview cards:
  - Total invoices
  - Recent uploads
- Quick action buttons
- Navigation menu
- Skeleton loaders while data is loading

---

### 3. Upload Invoice Page (/upload)
- Drag-and-drop file upload
- Validate file types (PDF)
- Upload progress indicator
- Loading spinner during extraction
- Clear success and error notifications
- After success, allow navigation to invoice details

---

### 4. Invoices List Page (/invoices)
- Table or grid view
- Sorting and filtering (vendor, date range)
- Pagination or infinite scrolling
- Click row to view invoice details
- Handle empty states gracefully

---

### 5. Invoice Details Page (/invoice/[id])
- Display extracted invoice data clearly
- Line items shown in a structured table
- Editable fields with basic validation
- Option to download the original invoice
- Clear back navigation

---

## UX & Architecture Guidance (Important)

Design this as a real production-grade SaaS frontend.

### UX Principles
- Always communicate state clearly (loading, success, error)
- Use skeleton loaders and empty states instead of blank screens
- Provide friendly, actionable error messages
- Keep flows simple: Upload → Extract → View Invoice → Navigate Back
- Use subtle animations and transitions

### Architecture Principles
- Separate concerns clearly:
  - UI components
  - Pages and layouts
  - Hooks (auth, data fetching)
  - API layer (all fetch calls in one place)
- Avoid duplicated logic
- Use TypeScript interfaces for:
  - Invoice
  - InvoiceItem
  - API responses
- Favor reusable and composable components
- Write code that can be extended later (edit, delete, export invoices)

---

## Code Quality Expectations
- Clean, readable, maintainable code
- Meaningful variable and component names
- Minimal logic inside JSX
- Prefer simplicity over over-engineering

---

## Styling Guidelines

Be creative and modern:
- SaaS-style UI
- Rounded corners, soft shadows
- Consistent spacing and typography
- Accessible color contrast
- Responsive design

Build this as if it were a real product you would proudly show to an employer.
