# Activity Log Testing Guide

## Overview
The Activity Log now has full logging capabilities integrated across all major operations. When users perform actions, they will be recorded in the Activity Log page.

## Features Implemented

### 1. **Activity Logging Framework** (`src/lib/activity-logger.ts`)
   - `logActivity(action, details)` - Records an activity with timestamp and user info
   - `getActivityLogs()` - Retrieves all stored logs sorted by timestamp
   - `clearActivityLogs()` - Clears all activity logs
   - Stores up to 1000 most recent logs in localStorage

### 2. **Logging Integration Points**

#### Upload Operations
- **File**: `src/app/upload/page.tsx`
- **Event**: When an invoice is successfully uploaded
- **Log Action**: `"Invoice Uploaded"`
- **Details**: Includes invoice ID, number, and filename

#### Deletion Operations
- **File**: `src/lib/api.ts`
- **Event**: When an invoice is deleted
- **Log Action**: `"Invoice Deleted"`
- **Details**: Invoice ID, number, and vendor name

#### Extraction Operations
- **File**: `src/lib/api.ts`
- **Event**: When invoice data is extracted from PDF
- **Log Action**: `"Invoice Extracted"`
- **Details**: Extraction metadata

#### Approval Workflow
- **File**: `src/app/approvals/page.tsx`
- **Events**: 
  - Invoice approval: `"Invoice Approved"`
  - Invoice rejection: `"Invoice Rejected"`
- **Details**: Admin notes and reasons

#### Duplicate Detection
- **File**: `src/app/duplicate-detection/page.tsx`
- **Event**: When duplicates are merged
- **Log Action**: `"Duplicates Merged"`
- **Details**: Count of merged invoices and master invoice info

#### Bulk Operations
- **File**: `src/app/bulk-operations/page.tsx`
- **Events**:
  - Bulk deletion: `"Bulk Delete"`
  - Bulk export: `"Bulk Export"`
- **Details**: Operation count

#### Archive Operations
- **File**: `src/app/archive/page.tsx`
- **Events**:
  - Invoice restore: `"Invoice Restored"`
  - Permanent delete: `"Invoice Permanently Deleted"`

#### Settings Changes
- **File**: `src/app/settings/page.tsx`
- **Events**:
  - Settings updated: `"Settings Updated"`
  - API key generated: `"API Key Generated"`
  - Settings exported: `"Settings Exported"`

### 3. **Activity Log Page** (`src/app/activity-log/page.tsx`)
- Displays all activities with timestamp, action, invoice info, and details
- Search functionality (by invoice number or details)
- Filter by action type
- Export logs to CSV
- Clear logs button with confirmation

## Testing Checklist

### Test 1: Upload Activity
1. Navigate to **Upload** page
2. Upload a PDF invoice
3. After extraction, go to **Activity Log** page
4. Verify `"Invoice Uploaded"` entry appears with:
   - Correct timestamp
   - Invoice number
   - Filename in details

### Test 2: Delete Activity
1. Navigate to **All Invoices** page
2. Find an invoice and click delete
3. Confirm deletion
4. Go to **Activity Log** page
5. Verify `"Invoice Deleted"` entry appears

### Test 3: Approval Workflow
1. Navigate to **Approvals** page
2. Select an invoice and approve/reject it
3. Add notes if desired
4. Go to **Activity Log** page
5. Verify `"Invoice Approved"` or `"Invoice Rejected"` entry

### Test 4: Bulk Operations
1. Navigate to **Bulk Operations** page
2. Select multiple invoices
3. Perform bulk delete or export
4. Go to **Activity Log** page
5. Verify corresponding entries appear

### Test 5: Duplicate Handling
1. Navigate to **Duplicate Detection** page
2. Merge duplicates if any exist
3. Go to **Activity Log** page
4. Verify `"Duplicates Merged"` entry appears

### Test 6: Archive & Restore
1. Navigate to **All Invoices** page
2. Delete an invoice (goes to archive)
3. Navigate to **Archive** page
4. Restore the invoice
5. Go to **Activity Log** page
6. Verify `"Invoice Deleted"` and `"Invoice Restored"` entries

### Test 7: Settings Changes
1. Navigate to **Settings** page
2. Change settings (export format, theme, etc.)
3. Click Save
4. Generate a new API key
5. Go to **Activity Log** page
6. Verify `"Settings Updated"` and `"API Key Generated"` entries

### Test 8: Activity Log Features
1. Go to **Activity Log** page
2. Test search by invoice number
3. Test filter by action type
4. Test export to CSV
5. Verify pagination/display works correctly

## Implementation Details

### Storage
- Activities stored in `localStorage` under key `'activityLogs'`
- Stored as JSON array of ActivityLog objects
- Limited to 1000 most recent entries to prevent bloat

### Activity Log Structure
```typescript
interface ActivityLog {
  id: string;           // Unique identifier
  action: string;       // e.g., "Invoice Uploaded"
  invoiceId?: string;   // Optional invoice reference
  invoiceNumber?: string; // Optional invoice number
  timestamp: string;    // ISO 8601 timestamp
  user: string;        // Always 'admin' in current implementation
  details?: string;    // Additional context
}
```

### Performance Notes
- Logging is non-blocking and wrapped in try-catch
- localStorage operations are asynchronous in UI thread
- Large activity logs (1000+ entries) are automatically pruned

## Known Limitations

1. **User Identification**: Currently logs all activities as user 'admin'
   - Future enhancement: Integrate with proper user authentication

2. **Persistence**: Activities stored only in browser localStorage
   - Data cleared on browser cache clear
   - Future enhancement: Backend database storage

3. **Real-time Updates**: Activity Log doesn't auto-refresh
   - User must navigate to page or manually refresh to see new entries
   - Future enhancement: WebSocket or polling for real-time updates

## Future Enhancements

1. Backend database integration for persistent storage
2. Real-time activity notifications
3. Advanced filtering and search (date range, user, etc.)
4. Activity analytics dashboard
5. Export to multiple formats (PDF, Excel, etc.)
6. Activity retention policies and archival
7. Role-based activity visibility
8. Webhook notifications for critical events

## Troubleshooting

### Activity Log Page Shows Empty
1. Verify you've performed at least one action (upload, delete, etc.)
2. Check browser console for errors
3. Verify localStorage is enabled in browser
4. Try refreshing the page

### Activities Not Appearing
1. Check that actions are being performed correctly
2. Verify no JavaScript errors in browser console
3. Check that localStorage 'activityLogs' key exists:
   - Open DevTools → Application → Local Storage → Check 'activityLogs'
4. If key doesn't exist, perform an action to trigger logging

### CSV Export Not Working
1. Check browser console for download errors
2. Ensure browser allows file downloads
3. Try a different browser if issue persists

## TypeScript Validation
All changes have been validated with zero TypeScript compilation errors:
- ✅ `activity-logger.ts` - Utility functions
- ✅ `api.ts` - API integration with logging
- ✅ `upload/page.tsx` - Upload logging
- ✅ `approvals/page.tsx` - Approval logging
- ✅ `duplicate-detection/page.tsx` - Duplicate logging
- ✅ `bulk-operations/page.tsx` - Bulk ops logging
- ✅ `archive/page.tsx` - Archive logging
- ✅ `settings/page.tsx` - Settings logging
- ✅ `activity-log/page.tsx` - Activity display
