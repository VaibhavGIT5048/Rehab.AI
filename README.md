# RehabAI - Smart Rehabilitation Platform

A modern React application for rehabilitation and recovery management with AI-powered guidance and professional support.

## Features

- 🏠 **Professional Feed** - Stay updated with your recovery community
- 💬 **AI Chat** - Connect with healthcare professionals and get AI-powered guidance
- 📹 **Exercise Tracking** - AI-powered exercise form analysis and tracking
- 📊 **Progress Analytics** - Comprehensive recovery progress tracking
- 🎥 **Media Library** - Educational videos and exercise demonstrations
- 👥 **Professional Network** - Find and connect with healthcare professionals
- 🎯 **Personalized Goals** - Set and track recovery milestones

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Video Player**: React Player

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rehab-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth, Theme)
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and configurations
├── pages/              # Page components
└── main.tsx           # Application entry point
```

## Key Features

### Authentication & Onboarding
- Secure user authentication with Supabase
- Comprehensive onboarding flow for new users
- Profile management with injury tracking

### AI-Powered Chat
- Real-time chat with healthcare professionals
- AI-powered responses and recommendations
- Exercise prescriptions and guidance

### Exercise Tracking
- AI-powered form analysis
- Real-time feedback during exercises
- Progress tracking and analytics

### Professional Network
- Browse and connect with healthcare professionals
- Filter by specialty, location, and ratings
- Direct messaging and video consultations

### Progress Analytics
- Comprehensive recovery tracking
- Visual progress charts and metrics
- Achievement system and milestones

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.