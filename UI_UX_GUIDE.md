# 🎨 UI/UX Visual Guide

## Application Overview

### Color System

```
Status Colors:
🟦 Blue (#3B82F6)      - Uploaded, Primary actions
🟨 Yellow (#EAB308)    - Processing, Warnings
🟩 Green (#22C55E)     - Extracted, Success
🟧 Orange (#F97316)    - Needs Review, Caution
⬜ Slate (#64748B)     - Neutral, Secondary
```

### Icon System

Every section has an icon for quick recognition:

```
📊 Dashboard
🏢 Vendor Information  
📤 Uploaded status
⚙️ Processing status
✅ Extracted status
⚠️ Needs Review status
📄 File/Upload
🔍 Details
💰 Pricing/Amount
📅 Date/Calendar
🎯 Quality/Confidence
```

---

## Page Layouts

### 1. Dashboard (`/dashboard`)

```
┌─────────────────────────────────────────┐
│ Dashboard                               │
│ Welcome to your invoice management      │
├─────────────────────────────────────────┤
│ [📊 Total] [📅 Month] [⚠️ Review] [💰 Avg] │  ← Metrics
├─────────────────────────────────────────┤
│ Quick Actions        │  Top Vendor      │
│ [📁 Upload]          │  Acme Corp       │
│ [📋 View All]        │  5 invoices      │
│ [⚠️ Review (3)]       │                  │
├─────────────────────────────────────────┤
│ Recent Invoices                         │
│ [Acme Corp]  $2,450  [✅ Extracted]    │
│ [Tech LLC]   $1,200  [⚠️ Needs Rev]   │
│ [Global]    $3,890  [✅ Extracted]    │
└─────────────────────────────────────────┘
```

### 2. Upload (`/upload`)

```
┌─────────────────────────────────────────────┐
│ Upload Invoice                              │
│ Upload and extract invoice details          │
├──────────────────────┬──────────────────────┤
│ UPLOAD AREA          │ REQUIREMENTS         │
│                      │ ✓ PDF format only    │
│ 📄                   │ ✓ Max 10MB           │
│ [Drag or click]      │ ✓ Clear & readable   │
│ PDF only             │                      │
│ (max 10MB)           │ HOW IT WORKS         │
│                      │ 1️⃣ Upload PDF       │
│                      │ 2️⃣ AI extracts      │
│                      │ 3️⃣ Review & manage  │
└──────────────────────┴──────────────────────┘
```

### 3. Invoices List (`/invoices`)

```
┌───────────────────────────────────────────────┐
│ All Invoices                                  │
│ View and manage your extracted invoices       │
├───────────────────────────────────────────────┤
│ [Search by vendor...] [Search] [Clear]       │
├───────────────────────────────────────────────┤
│ Invoice │ Vendor    │ Date   │ Amount │ Status│
├─────────┼───────────┼────────┼────────┼───────┤
│ INV-001 │ Acme Corp │ Jan 10 │ $2,450 │ ✅   │
│ INV-002 │ Tech LLC  │ Jan 08 │ $1,200 │ ⚠️   │
│ INV-003 │ Global    │ Jan 05 │ $3,890 │ ✅   │
└─────────┴───────────┴────────┴────────┴───────┘
```

### 4. Invoice Details (`/invoice/[id]`)

```
┌──────────────────────────────────────┐
│ ← Back | Invoice INV-001            │ ✅ Extracted
│ Extracted on Jan 10, 2024 10:30     │
├──────────────────────────────────────┤
│ ⚠️ Fields Requiring Review (2)       │
│ The following fields have low        │
│ confidence scores and may require    │
│ manual review.                       │
├────────────────┬────────────────────┤
│ 🏢 Vendor      │ 📊 Summary         │
│ Acme Corp      │ Date: Jan 10, 2024 │
│ [━━━━━━━━] 92% │ Due: Feb 10, 2024  │
│ invoices@...   │ Subtotal: $2,231   │
│ +1-555-...     │ Tax: $219          │
│                │ Total: $2,450      │
├────────────────┼────────────────────┤
│ 📦 Line Items  │ 🎯 Quality         │
│ Item │ Qty │   │ VendorName 92%     │
│ ────┼─────┤   │ [━━━━━━━━]         │
│ ...  │ 20  │   │ InvoiceId 88%      │
│      │     │   │ [━━━━━ ]          │
├────────────────┤ InvoiceDate 95%    │
│ 📝 Notes       │ [━━━━━━━━━]        │
│ Payment terms: │ Total 90%          │
│ Net 30         │ [━━━━━━━]          │
└────────────────┴────────────────────┘
```

---

## Component States

### FileUploader States

```
IDLE STATE (Ready)
┌─────────────────────────┐
│ 📄                      │
│ Drag and drop invoice   │
│ PDF only (max 10MB)     │
│ [Browse Files]          │
└─────────────────────────┘

UPLOADING STATE
┌─────────────────────────┐
│ 📤                      │
│ Uploading invoice...    │
│ Please wait...          │
│ [Loading spinner]       │
│ [████░░░░░░░░] 40%      │
└─────────────────────────┘

ANALYZING STATE
┌─────────────────────────┐
│ ⚙️                      │
│ Extracting invoice data │
│ using AI...             │
│ [Loading spinner]       │
│ [██████░░░░░░] 60%      │
└─────────────────────────┘

SUCCESS STATE
┌─────────────────────────┐
│ ✅                      │
│ Invoice processed!      │
│ Your invoice details    │
│ will load shortly...    │
│ [Upload Another]        │
└─────────────────────────┘

ERROR STATE
┌─────────────────────────┐
│ ❌                      │
│ Processing failed       │
│ ⚠️ Invalid PDF format   │
│ [Try Another File]      │
└─────────────────────────┘
```

### Status Badges

```
📤 UPLOADED (Blue)
┌──────────────────┐
│ 📤 Uploaded      │
└──────────────────┘

⚙️ PROCESSING (Yellow)
┌──────────────────┐
│ ⚙️ Processing    │
└──────────────────┘

✅ EXTRACTED (Green)
┌──────────────────┐
│ ✅ Extracted     │
└──────────────────┘

⚠️ NEEDS REVIEW (Orange)
┌──────────────────┐
│ ⚠️ Needs Review  │
└──────────────────┘
```

### Confidence Indicators

```
HIGH CONFIDENCE (≥90%)
[████████████████░] 92%  ← Green bar

CONFIDENT (70-89%)
[████████████░░░░░] 81%  ← Blue bar

LOW CONFIDENCE (50-69%)
[██████░░░░░░░░░░░] 58%  ← Yellow bar

VERY LOW (<50%)
[████░░░░░░░░░░░░░] 35%  ← Red bar
```

---

## Typography Hierarchy

```
📌 Headline 1 (text-4xl)
Page titles, major sections
"Invoice INV-001"

📌 Headline 2 (text-xl)
Section headers
"Vendor Information"

📌 Body (text-base)
Main content, descriptions
"Vendor name goes here"

📌 Caption (text-xs)
Labels, hints, meta info
"VENDOR NAME (uppercase)"

📌 Small text (text-sm)
Secondary info, descriptions
"Extracted on Jan 10, 2024"
```

---

## Spacing & Layout

```
Margin/Padding Hierarchy:
- Large gaps: 32px (mb-8, p-8)
- Medium gaps: 24px (mb-6, gap-6)
- Small gaps: 16px (mb-4, p-4)
- Tiny gaps: 8px (mb-2, p-2)

Grid Layouts:
Mobile: 1 column
Tablet: 2 columns (md:)
Desktop: 3-4 columns (lg:)

Card Spacing:
Header: 24px padding
Body: 24px padding
Gaps between cards: 24px
```

---

## Interactive Elements

### Button States

```
PRIMARY BUTTON (Blue)
┌──────────────────┐
│ 📁 Upload        │ ← Default
└──────────────────┘

┌──────────────────┐
│ 📁 Upload        │ ← Hover (darker)
└──────────────────┘

┌──────────────────┐
│ 📁 Upload        │ ← Active (scale)
└──────────────────┘

┌──────────────────┐
│ 📁 Upload        │ ← Disabled (faded)
└──────────────────┘

SECONDARY BUTTON (Slate)
┌──────────────────┐
│ ← Back           │ ← Outline style
└──────────────────┘
```

### Input Fields

```
IDLE STATE
┌──────────────────────────┐
│ Search by vendor...      │
└──────────────────────────┘

FOCUSED STATE (Blue ring)
┌──────────────────────────┐
│ Acme                     │
└──────────────────────────┘
     ↑ Blue focus ring

ERROR STATE (Red border)
┌──────────────────────────┐
│ @invalid-email           │
└──────────────────────────┘
     ↑ Red border + error message
```

---

## Empty States

```
NO INVOICES
┌─────────────────────────────┐
│         📄                  │
│  Get Started                │
│  Upload your first          │
│  invoice to start           │
│  extracting structured      │
│  data with AI-powered       │
│  analysis.                  │
│                             │
│ [Upload Your First Invoice] │
└─────────────────────────────┘

NO SEARCH RESULTS
┌─────────────────────────────┐
│         📋                  │
│  No invoices found          │
│  Upload your first          │
│  invoice to get started     │
└─────────────────────────────┘
```

---

## Alerts & Messages

```
SUCCESS MESSAGE (Green)
┌─────────────────────────┐
│ ✅ Invoice updated!     │
│    Successfully saved   │
└─────────────────────────┘

ERROR MESSAGE (Red)
┌─────────────────────────┐
│ ❌ Processing failed    │
│    File format invalid  │
└─────────────────────────┘

WARNING ALERT (Orange)
┌────────────────────────────┐
│ ⚠️ Fields Requiring Review │
│ 2 field(s) have low        │
│ confidence scores and      │
│ may require manual review. │
└────────────────────────────┘

INFO ALERT (Blue)
┌────────────────────────────┐
│ 📋 PDF Only                │
│ This application supports  │
│ PDF files only for invoice │
│ extraction.                │
└────────────────────────────┘
```

---

## Responsive Design

### Desktop (≥1024px)
```
┌──────────────────────────────────┐
│ Navbar (full)                    │
├────────────┬─────────────────────┤
│ Sidebar    │ Main Content (full) │
│ (fixed)    │                     │
│            │ [Metric 1] [M2] [M3]│
│ ✓ Upload   │ [M4]                │
│ ✓ Invoices │                     │
│ ✓ Settings │ [Cards in 2-4 col]  │
│            │                     │
└────────────┴─────────────────────┘
```

### Tablet (768px-1023px)
```
┌──────────────────────┐
│ Navbar (hamburger)   │
├──────────────────────┤
│ Main Content (full)  │
│ [Metric 1] [M2]      │
│ [M3] [M4]            │
│ [Cards in 2 col]     │
└──────────────────────┘
```

### Mobile (<768px)
```
┌──────────────────┐
│ Navbar (mobile)  │
├──────────────────┤
│ Main Content     │
│ [Metric 1]       │
│ [Metric 2]       │
│ [Metric 3]       │
│ [Cards in 1 col] │
│ [Full width]     │
└──────────────────┘
```

---

## Animation & Transitions

```
HOVER EFFECTS
- Buttons: scale(0.95) + darker color
- Cards: shadow increase + scale(1.02)
- Rows: bg color fade

TRANSITIONS
- All: duration-200
- Smooth color changes
- Subtle scale transforms

LOADING
- Skeleton: pulse animation
- Spinner: rotate animation
- Progress bar: smooth fill

FEEDBACK
- Toast: slide + fade in/out
- Alert: shake on error
- Success: checkmark animation
```

---

This visual guide helps understand the professional SaaS design of your application!
