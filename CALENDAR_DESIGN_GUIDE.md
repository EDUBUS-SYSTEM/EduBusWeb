# EduBus Calendar Design Guide

## Overview
This guide provides information about the calendar system designed for EduBus, featuring a Google Calendar-like interface with soft UI aesthetics and backend integration.

## 🎨 Design Philosophy

### Soft UI Aesthetic
- **Large border-radius**: 12px+ for all components
- **Gentle shadows**: Soft, subtle shadows for depth
- **Pastel gradients**: Soft neon blue and white color scheme
- **Smooth transitions**: 300ms ease-in-out animations
- **Playful toy store style**: Friendly, approachable design

### Color Scheme
- **Primary**: Soft neon blue (`#38bdf8` to `#0ea5e9`)
- **Secondary**: Cyan (`#22d3ee` to `#06b6d4`)
- **Background**: Gradient from cyan-50 to blue-50
- **Cards**: White with soft shadows
- **No purple**: As per user preference

## 📁 File Structure

```
src/
├── components/calendar/
│   ├── Calendar.tsx          # Main calendar component
│   ├── CalendarHeader.tsx    # Header with navigation and controls
│   ├── CalendarGrid.tsx      # Grid layout for different views
│   ├── EventCard.tsx         # Individual event display
│   └── index.ts             # Export file
├── data/
│   └── mockCalendarData.ts   # Sample data based on backend models
├── types/
│   └── index.ts             # TypeScript interfaces
└── app/
    ├── calendar/            # Main calendar page
    ├── calendar-demo/       # Interactive demo
    └── calendar-samples/    # Design samples
```

## 🚀 Getting Started

### 1. Access the Calendar
Navigate to `/calendar` to see the main calendar interface.

### 2. Interactive Demo
Visit `/calendar-demo` for a fully functional calendar with:
- Click events to view details
- Switch between day/week/month views
- Navigate through dates
- Create new events (placeholder functionality)

### 3. Design Samples
Visit `/calendar-samples` to explore different layouts and designs.

## 🎯 Features

### View Modes
- **Day View**: Detailed hourly schedule with time slots
- **Week View**: 7-day overview with daily columns
- **Month View**: Full month grid with event previews

### Event Types
- **Trip Events** (Blue): Bus routes and transportation
- **Schedule Events** (Cyan): Regular schedule items
- **Maintenance Events** (Orange): Vehicle maintenance
- **Other Events** (Purple): General events

### Event Status
- **Planned**: Scheduled but not started
- **In Progress**: Currently active
- **Completed**: Finished
- **Cancelled**: Cancelled events

## 🔧 Backend Integration

### Models Used
Based on the backend models in `TEST_API/EduBusAPIs/Data/Models/`:

1. **Schedule**: Main schedule configuration
   - RRule support for recurring schedules
   - Timezone handling
   - Exception date management

2. **RouteSchedule**: Route-schedule associations
   - Priority levels
   - Effective date ranges

3. **Trip**: Actual trip instances
   - Real-time tracking
   - Status management
   - Schedule snapshots

4. **TripStop**: Individual stop details
   - Location information
   - Attendance tracking
   - Timing data

### Data Flow
```
Backend Models → TypeScript Interfaces → Calendar Components → UI Display
```

## 🎨 Customization

### Colors
Update colors in `tailwind.config.js`:
```javascript
colors: {
  'soft-blue': { /* blue shades */ },
  'soft-cyan': { /* cyan shades */ },
}
```

### Styling
Modify component styles in individual `.tsx` files:
- Use `rounded-2xl` for large border radius
- Apply `shadow-soft-lg` for gentle shadows
- Use gradient classes for soft effects

### Animations
Add custom animations in `tailwind.config.js`:
```javascript
animation: {
  'fade-in': 'fadeIn 0.3s ease-out',
  'slide-up': 'slideUp 0.3s ease-out',
}
```

## 📱 Responsive Design

The calendar is fully responsive with:
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interactions
- Adaptive spacing

## 🔮 Future Enhancements

### Planned Features
- [ ] Real-time event updates
- [ ] Drag-and-drop event creation
- [ ] Event filtering and search
- [ ] Export functionality
- [ ] Mobile app integration
- [ ] Push notifications
- [ ] Offline support

### Backend Integration
- [ ] API endpoints for CRUD operations
- [ ] Real-time WebSocket connections
- [ ] Authentication integration
- [ ] Role-based permissions

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Next.js 14+
- TypeScript
- Tailwind CSS

### Installation
```bash
cd Nextjs_web/EduBusWeb
npm install
npm run dev
```

### Adding New Event Types
1. Update `CalendarEvent` interface in `types/index.ts`
2. Add color mapping in `EventCard.tsx`
3. Update mock data in `mockCalendarData.ts`

### Creating New Views
1. Add view type to `CalendarView` interface
2. Implement view logic in `CalendarGrid.tsx`
3. Update header controls in `CalendarHeader.tsx`

## 📊 Performance

### Optimizations
- Lazy loading for large datasets
- Virtual scrolling for month view
- Memoized components
- Efficient re-rendering

### Bundle Size
- Tree-shaking enabled
- Component-based architecture
- Minimal dependencies

## 🧪 Testing

### Manual Testing
1. Navigate between different views
2. Click on events to view details
3. Test responsive design on different screen sizes
4. Verify color scheme consistency

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 Notes

- All components are built with TypeScript for type safety
- Follows React best practices and hooks
- Accessible design with proper ARIA labels
- SEO-friendly with proper meta tags

## 🤝 Contributing

When contributing to the calendar system:
1. Follow the established design patterns
2. Maintain the soft UI aesthetic
3. Ensure TypeScript compliance
4. Test across different view modes
5. Update documentation as needed

---

*This calendar system is designed to provide an intuitive, beautiful, and functional interface for managing EduBus schedules while maintaining consistency with the overall application design.*
