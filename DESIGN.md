# 🎨 UI/UX Preview - InvParser Frontend

## Page Layouts & Features

### 🔐 **1. LOGIN PAGE** (`/login`)

```
┌─────────────────────────────────┐
│                                 │
│        [IP Logo]                │
│        InvParser                │
│   Invoice Management Dashboard  │
│                                 │
│   ┌───────────────────────────┐ │
│   │  Username                 │ │
│   │  [admin            ]      │ │
│   │                           │ │
│   │  Password                 │ │
│   │  [••••••••        ]       │ │
│   │                           │ │
│   │  [   Sign In   ]          │ │
│   │                           │
│   │  Demo Credentials         │
│   │  Username: admin          │
│   │  Password: admin          │
│   └───────────────────────────┘ │
│                                 │
└─────────────────────────────────┘

Features:
✓ Clean centered design
✓ Gradient background
✓ Demo credentials shown
✓ Error message support
✓ Loading state
```

---

### 📊 **2. DASHBOARD** (`/dashboard`)

```
┌─────────────────────────────────────────────────────┐
│ [IP] InvParser          Welcome, admin       [Logout]│
├─────────────────────────────────────────────────────┤
│ 📊 Dashboard  📁 Upload  📋 Invoices                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Welcome to InvParser                              │
│  Manage and track your invoices efficiently        │
│                                                     │
│  ┌──────────┬──────────┬──────────┬──────────┐   │
│  │📊        │📅        │⏳        │💰        │   │
│  │Total     │This      │Pending   │Total     │   │
│  │Invoices  │Month     │Review    │Amount    │   │
│  │24        │8         │3         │$45,290   │   │
│  └──────────┴──────────┴──────────┴──────────┘   │
│                                                     │
│  Quick Actions                                      │
│  ┌─────────────┐  ┌──────────────────┐            │
│  │📁 Upload    │  │📋 View All       │            │
│  │Invoice      │  │Invoices          │            │
│  └─────────────┘  └──────────────────┘            │
│                                                     │
│  Recent Uploads                                     │
│  Acme Corp              2 hours ago      $2,450    │
│  Tech Solutions         5 hours ago      $1,200    │
│  Global Services        Yesterday        $3,890    │
│                                                     │
└─────────────────────────────────────────────────────┘

Features:
✓ 4 stat cards with icons
✓ Quick action buttons
✓ Recent uploads list
✓ Protected route
✓ Professional grid layout
```

---

### 📤 **3. UPLOAD PAGE** (`/upload`)

```
┌─────────────────────────────────────────────────────┐
│ [IP] InvParser          Welcome, admin       [Logout]│
├─────────────────────────────────────────────────────┤
│ 📊 Dashboard  📁 Upload  📋 Invoices                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Upload Invoice                                     │
│  Upload and extract invoice details automatically  │
│                                                     │
│  ┌─────────────────────────┐  ┌────────────────┐  │
│  │                         │  │Supported       │  │
│  │  ╱╱┌─────────────┐      │  │Formats         │  │
│  │ ╱╱ │     📄      │      │  │✓ PDF           │  │
│  │╱╱  └─────────────┘      │  │✓ JPEG          │  │
│  │                         │  │✓ PNG           │  │
│  │  Drag and drop your     │  │                │  │
│  │  invoice                │  │Tips            │  │
│  │        or               │  │✓ Clear images  │  │
│  │  ┌─────────────────┐    │  │✓ Max 10MB      │  │
│  │  │ Browse Files    │    │  │✓ All legible   │  │
│  │  └─────────────────┘    │  │                │  │
│  │                         │  │[View All]      │  │
│  │ PDF, JPG, PNG (Max 10MB)│  └────────────────┘  │
│  └─────────────────────────┘                       │
│                                                     │
│  Progress Bar (while uploading):                   │
│  [████████░░░░░░░░░░░░░░░░░] 50%                  │
│                                                     │
└─────────────────────────────────────────────────────┘

Features:
✓ Drag-and-drop zone
✓ File type validation
✓ Size validation (10MB)
✓ Upload progress
✓ Success/error messages
✓ Info panels with tips
✓ Responsive layout
```

---

### 📋 **4. INVOICES LIST** (`/invoices`)

```
┌─────────────────────────────────────────────────────┐
│ [IP] InvParser          Welcome, admin       [Logout]│
├─────────────────────────────────────────────────────┤
│ 📊 Dashboard  📁 Upload  📋 Invoices                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  All Invoices                                       │
│  View and manage your extracted invoices           │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ Search by vendor...  [Search] [Clear]         │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Invoices (3)              ┌──────────────────┐    │
│  ┌─────────────────────────┤+ Upload New      │    │
│  │ Invoice # │ Vendor      └──────────────────┘    │
│  ├─────────────────────────┤ Date       Amount     │
│  │ INV-001   │ Acme Corp   │ Jan 10,24  $2,450    │
│  │ INV-002   │ Tech Solutions│ Jan 08,24 $1,200    │
│  │ INV-003   │ Global Srv  │ Jan 05,24  $3,890    │
│  └─────────────────────────┴─────────────────────┘ │
│                                                     │
│  Click any row to view details                      │
│                                                     │
└─────────────────────────────────────────────────────┘

Features:
✓ Search by vendor
✓ Filter and clear
✓ Table view
✓ Clickable rows
✓ Formatted dates
✓ Currency display
✓ Status badges
✓ Empty state handling
```

---

### 📝 **5. INVOICE DETAILS** (`/invoice/[id]`)

```
┌─────────────────────────────────────────────────────┐
│ [IP] InvParser          Welcome, admin       [Logout]│
├─────────────────────────────────────────────────────┤
│ 📊 Dashboard  📁 Upload  📋 Invoices                │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ← Back to Invoices                                  │
│ Invoice INV-001                                     │
│ Extracted on Jan 10, 2024 10:30      [Edit][Dwld]  │
│                                                     │
│ ┌─────────────────────────────┐  ┌───────────────┐ │
│ │ Vendor Information          │  │Summary        │ │
│ │ Vendor Name                 │  │Invoice Date   │ │
│ │ Acme Corporation            │  │Jan 10, 2024   │ │
│ │                             │  │               │ │
│ │ Email                       │  │Due Date       │ │
│ │ invoices@acme.com           │  │Feb 10, 2024   │ │
│ │                             │  │               │ │
│ │ Phone                       │  │Subtotal       │ │
│ │ +1 (555) 123-4567          │  │$2,205.00      │ │
│ └─────────────────────────────┘  │               │ │
│                                   │Tax           │ │
│ Line Items                        │$245.00       │ │
│ ┌─────────────┬──┬────────┬─────┐│               │ │
│ │Description  │Q │Price   │Total││Total         │ │
│ ├─────────────┼──┼────────┼─────┤│$2,450.00     │ │
│ │Consulting   │20│$100    │2000 ││               │ │
│ │License      │1 │$205    │205  ││[✓ Extracted] │ │
│ └─────────────┴──┴────────┴─────┘└───────────────┘ │
│                                                     │
│ Notes                                               │
│ Payment terms: Net 30                              │
│                                                     │
└─────────────────────────────────────────────────────┘

Features:
✓ Full invoice display
✓ Vendor details
✓ Line items table
✓ Edit mode toggle
✓ Editable fields
✓ Summary card
✓ Download button
✓ Back navigation
✓ Status badge
```

---

## 🎨 Component Gallery

### **Buttons**
```
┌──────────────────────────────────┐
│ [Primary Button]                 │
│ [Secondary Button]               │
│ [Destructive Button]             │
│ [Ghost Button]                   │
│                                  │
│ [Loading Button...]              │
│ [Disabled Button]                │
└──────────────────────────────────┘
```

### **Form Inputs**
```
┌──────────────────────────────────┐
│ Label Text                       │
│ [Input placeholder text...]      │
│ Helper text                      │
│                                  │
│ Label Text                       │
│ [Input...]                       │
│ ⚠️ Error message                 │
└──────────────────────────────────┘
```

### **Cards**
```
┌────────────────────────────┐
│ Card Header with Title     │
├────────────────────────────┤
│                            │
│  Card body content here    │
│                            │
├────────────────────────────┤
│ Card Footer (if needed)    │
└────────────────────────────┘
```

### **Badges**
```
┌──────────────────────────┐
│ [✓ Extracted]            │
│ [⚠ Pending]              │
│ [✓ Completed]            │
│ [✕ Error]                │
└──────────────────────────┘
```

### **Loading Skeleton**
```
┌────────────────────────────┐
│ ██████████░░░░░░░░░░░░    │ Loading
│ ██████░░░░░░░░░░░░░░░░    │ Loading
│ ████████████░░░░░░░░░░    │ Loading
│ ██████████░░░░░░░░░░░░    │ Loading
└────────────────────────────┘
```

---

## 🌈 Color Palette

```
Primary:     #2563eb (Blue)      [Primary Button, Links]
Secondary:   #64748b (Slate)     [Secondary Button, Text]
Success:     #10b981 (Green)     [✓ Badges, Success Messages]
Warning:     #f59e0b (Amber)     [⚠ Warnings, Alerts]
Destructive: #ef4444 (Red)       [✕ Delete, Error States]
```

---

## 📱 Responsive Breakpoints

```
Mobile (sm):    < 640px   - Single column layout
Tablet (md):    640-768px - 2 column layout
Desktop (lg):   768-1024px - 3 column layout
Wide (xl):      > 1024px  - Full layout with sidebar
```

---

## ✨ Animations & Interactions

- ✅ Hover effects on buttons and rows
- ✅ Smooth transitions (200ms)
- ✅ Loading spinners
- ✅ Toast notifications (success/error)
- ✅ Drag-and-drop feedback
- ✅ Fade-in effects
- ✅ Loading skeleton pulse

---

## 🎯 Design Principles Applied

✅ **Clean** - No clutter, clear hierarchy
✅ **Modern** - Contemporary SaaS aesthetic
✅ **Professional** - Production-quality design
✅ **Intuitive** - Easy navigation and understanding
✅ **Accessible** - Good contrast, readable fonts
✅ **Responsive** - Works on all devices
✅ **Consistent** - Unified design language

---

This comprehensive UI/UX was built to look and feel like a real SaaS product used by finance and operations teams.
