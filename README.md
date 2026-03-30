# IT Service Tracker

A modern web application for managing IT service tickets with real-time synchronization to Google Sheets. Built with Next.js, React, and TypeScript.

## Features

- 🎫 **Ticket Management** - Create, read, update, and delete service tickets
- 📊 **Dashboard** - View all tickets in an interactive table with status tracking
- 🔄 **Google Sheets Sync** - Automatic synchronization with Google Sheets for data persistence
- 🔐 **Authentication** - Secure login system for accessing tickets
- 🎨 **Modern UI** - Clean and responsive interface with dark/light theme support
- 📈 **Status Tracking** - Visual status badges and sync status indicators
- 📱 **Responsive Design** - Works seamlessly across devices

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 16.1.7
- **UI Library**: [React](https://react.dev/) 19.2.3
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5
- **Styling**: CSS Modules
- **Charts**: [Recharts](https://recharts.org/) 3.8.0
- **Icons**: [Lucide React](https://lucide.dev/) 0.577.0
- **Google Integration**: 
  - google-spreadsheet 5.2.0
  - google-auth-library 10.6.2

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm installed
- Google Cloud Project with Sheets API enabled
- Google service account credentials (JSON file)

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd IT-service-tracker/app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the `app` directory with your Google Sheets credentials:
   ```env
   GOOGLE_SHEET_ID=your_spreadsheet_id
   GOOGLE_AUTH_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY=your_private_key
   ```

## Getting Started

1. **Development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

2. **Build for production**
   ```bash
   npm run build
   npm start
   ```

3. **Run linting**
   ```bash
   npm run lint
   ```

## Project Structure

```
app/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   └── tickets/         # Ticket CRUD endpoints
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── TicketTable.tsx  # Ticket list display
│   │   ├── AddTicketModal.tsx
│   │   ├── EditTicketModal.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── SyncStatus.tsx
│   │   └── ThemeToggle.tsx
│   ├── context/             # React context
│   │   └── AuthContext.tsx
│   ├── hooks/               # Custom hooks
│   │   └── useTickets.ts
│   ├── login/               # Authentication page
│   └── types/               # TypeScript types
│       └── ticket.ts
├── lib/                      # Utility functions
│   └── googleSheet.ts       # Google Sheets integration
├── public/                   # Static assets
└── package.json
```

## API Endpoints

### Tickets
- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create a new ticket
- `GET /api/tickets/[id]` - Get a specific ticket
- `PUT /api/tickets/[id]` - Update a ticket
- `DELETE /api/tickets/[id]` - Delete a ticket

## Google Sheets Setup

1. Create a new Google Cloud Project
2. Enable the Google Sheets API
3. Create a service account and download the JSON credentials
4. Share your Google Sheet with the service account email
5. Add the Sheet ID and credentials to your `.env.local` file

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.
