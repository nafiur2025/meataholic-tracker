# Meataholic Cost Tracker

A mobile-optimized cost tracking webapp for food delivery businesses with Firebase authentication and cloud database.

## Features

- **User Authentication** - Email/password and Google sign-in
- **Daily Cost Entry** - Track expenses by category (Stock, Uber/Delivery, Salaries, Meta Ads, etc.)
- **Revenue Tracking** - Record daily revenue from online, cash, and other sources
- **Stock Management** - Track inventory with low stock alerts
- **Consumables Tracking** - Monitor packaging, cleaning supplies, etc.
- **P&L Dashboard** - Visual charts showing daily breakdown and category analysis
- **Expense History** - Search, filter, and manage all entries
- **Real-time Sync** - Cloud database with instant updates across devices

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Firebase Authentication
- Firebase Firestore Database
- Recharts for data visualization

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment Options

### Option 1: Netlify (Recommended for Frontend)
1. Connect GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`

### Option 2: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Option 3: GitHub Pages
See `.github/workflows/deploy.yml` for automated deployment.

## Firebase Setup

The app is pre-configured with Firebase. Ensure these are enabled in your Firebase Console:

1. **Authentication** - Email/Password and Google providers
2. **Firestore Database** - Create database with these collections:
   - `expenses`
   - `revenue`
   - `stock`
   - `consumables`

## License

MIT
