# Blue Angels Care - Healthcare Mobile App

A professional mobile application for Blue Angels Care healthcare management system, built with React Native and Expo.

## Features

### 1. **Login Screen**
- Secure authentication with username and password
- Professional healthcare-themed UI
- Password visibility toggle
- Forgot password functionality
- Company branding with Blue Angels Care logo

### 2. **Schedule Management**
- View daily patient care schedules
- Patient information display (name, ID, address)
- Time slots and appointment status tracking
- Status indicators (Upcoming, In Progress, Completed)
- Quick actions: Call, Navigate, Details
- Pull-to-refresh functionality

### 3. **Daily Care Notes** (Core Business Feature)
- **Employee Information**: Name and Employee ID
- **Patient Information**: Name and Patient ID
- **Care Details**: 
  - Care location
  - Check-in/Check-out times
  - Detailed care content documentation
- **Meal Tracking**:
  - Breakfast, Lunch, Dinner sections
  - Time tracking for each meal
  - "What did the individual have?" field
  - "What was offered?" field
- **Digital Signatures**: Employee and Patient signatures
- Form validation and data persistence
- Clear and Save functionality

### 4. **Settings & Profile**
- User profile information display
- Employee details (ID, email, phone, department, role)
- App preferences:
  - Push notifications toggle
  - Auto-sync settings
  - Manual data sync
- Account management:
  - Password change
  - Help & support
- Secure logout functionality

## Technical Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Icons**: Expo Vector Icons (Ionicons)
- **Language**: TypeScript
- **Styling**: StyleSheet (Native)

## Project Structure

```
app/
├── login.tsx                 # Authentication screen
├── _layout.tsx              # Root navigation layout
├── (tabs)/                  # Tab navigation group
│   ├── _layout.tsx         # Tab bar configuration
│   ├── index.tsx           # Schedule screen
│   ├── daily-note.tsx      # Daily care notes form
│   └── settings.tsx        # Settings and profile
├── components/             # Reusable components
└── constants/
    └── theme.ts           # App colors and branding
```

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend_mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/emulator**
   - Scan QR code with Expo Go app (mobile)
   - Press 'w' for web browser
   - Press 'a' for Android emulator
   - Press 'i' for iOS simulator

## App Navigation Flow

1. **Login** → Authentication required
2. **Schedule Tab** → View daily patient schedules
3. **Daily Note Tab** → Create care documentation
4. **Settings Tab** → Manage profile and app settings

## Key Business Features

### Daily Care Notes Form
This is the core business functionality that allows healthcare workers to:

- Document patient care activities (library visits, church, doctor appointments, etc.)
- Track meal consumption and offerings for breakfast, lunch, and dinner
- Record check-in/check-out times
- Capture digital signatures from both employee and patient
- Maintain compliance with healthcare documentation requirements

### Professional UI/UX
- Healthcare industry-appropriate color scheme (Blue Angels Care branding)
- Clean, professional interface suitable for enterprise use
- Intuitive navigation for healthcare workers
- Responsive design for various mobile devices

## Future Enhancements

- API integration for backend data synchronization
- Offline mode with local data storage
- Photo capture for care documentation
- GPS tracking for location verification
- Push notifications for schedule updates
- Multi-language support
- Advanced reporting features

## Demo Data

The app currently uses mock data for demonstration purposes:

- **Login**: Accept any username/password combination
- **Schedule**: Sample patient appointments with different statuses
- **User Profile**: Mock healthcare worker information

## Support

For technical support or feature requests, contact the Blue Angels Care IT department.

## License

© 2024 Blue Angels Care. All rights reserved.