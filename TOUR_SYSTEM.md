# Product Tour System

This application includes a modern product tour system using the `onborda` library to guide new users through the onboarding process.

## How It Works

### Automatic Tour Display

The tour automatically shows when:

1. **New User**: A user signs up/logs in for the first time (detected by `createdAt` timestamp within last 5 minutes)
2. **Never Completed**: User hasn't completed the tour before (stored in `localStorage`)
3. **Manual Testing**: User is manually marked as "new" via test controls

### Tour Types

- **Desktop Tour**: Shows on screens ≥768px width
- **Mobile Tour**: Shows on screens <768px width
- **Document Upload Tour**: Shows when user is on `/user/documents` page

### Tour Steps

1. **Upload Documents** - Guides user to upload required documents
2. **Required Documents** - Shows what documents are needed
3. **User Guide** - Points to general guidelines

## Files Structure

```
components/tour/
├── tour-provider.tsx      # Main tour logic and state management
├── custom-tour-card.tsx  # Custom tour card UI component
└── tour-test-controls.tsx # Testing controls (dev only)

lib/
├── tour-config.ts        # Tour step definitions
└── tour-utils.ts         # Utility functions for tour management
```

## Testing

### Test Controls (Development)

The `TourTestControls` component provides buttons to:

- **Start Tour**: Manually trigger the tour
- **Reset Tour**: Clear tour completion status
- **Mark as New User**: Simulate new user experience

### Manual Testing

```javascript
// In browser console:
localStorage.setItem("fastcodeai-new-user", "true");
window.location.reload();
```

## Configuration

### Adding New Tour Steps

Edit `lib/tour-config.ts` to add/modify tour steps:

```typescript
{
  icon: "📄",
  title: "Step Title",
  content: "Step description",
  selector: "#element-id",
  side: "top-right",
  pointerPadding: 12,
  pointerRadius: 12,
}
```

### Targeting Elements

Add `id` attributes to elements you want to highlight:

```tsx
<Button id="upload-documents-button">Upload Documents</Button>
```

## Storage

The system uses `localStorage` to track:

- `fastcodeai-tour-completed`: Whether user completed tour
- `fastcodeai-new-user`: Manual flag for testing new user experience

## Responsive Design

Tour cards automatically adjust for mobile:

- Smaller width (`w-72` vs `w-80`)
- Adjusted margins and positioning
- Mobile-specific tour steps (no navigation menu step)

## Integration Points

- **Authentication**: Detects new users via session `createdAt`
- **User Role**: Only shows for `USER` role (not `ADMIN`)
- **Page Detection**: Automatically selects appropriate tour based on current page
