# Product Tour System

This application includes a modern product tour system using the `onborda` library to guide new users through the onboarding process.

## How It Works

### Automatic Tour Display

The tour automatically shows when:

1. **API-Driven**: Tour status is determined by API calls to `/api/users/tour-status`
2. **Dashboard Trigger**: Tour is triggered via custom event from dashboard after checking API status
3. **Never Completed**: User hasn't completed the tour before (stored in database)

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
└── tour-error-boundary.tsx # Error boundary for tour system

lib/
├── tour-config.ts        # Tour step definitions
└── tour-utils.ts         # API utility functions for tour management

hooks/
└── use-viewport-constraints.ts # Viewport constraint hook
```

## API Integration

The tour system uses API endpoints:

- **GET `/api/users/tour-status`**: Check if user has completed tour
- **PATCH `/api/users/tour-completion`**: Mark tour as completed

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

The system uses database storage via API:

- Tour completion status is stored in the database
- No client-side localStorage dependencies
- Consistent across devices and sessions

## Responsive Design

Tour cards automatically adjust for mobile:

- Smaller width (`w-72` vs `w-80`)
- Adjusted margins and positioning
- Mobile-specific tour steps (no navigation menu step)

## Integration Points

- **Authentication**: Detects new users via session
- **User Role**: Only shows for `USER` role (not `ADMIN`)
- **Page Detection**: Automatically selects appropriate tour based on current page
- **API-Driven**: All tour state managed server-side
