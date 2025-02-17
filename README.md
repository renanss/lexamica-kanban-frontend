# Lexamica Kanban Frontend

A real-time Kanban board frontend demo built with Next.js and React Bootstrap.

## Tech Stack

- Next.js 15.1
- React 18
- React Bootstrap
- React DnD (Drag and Drop)
- Socket.IO Client
- SCSS for styling
- TypeScript

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API route handlers
│   ├── components/            # React components
│   │   ├── board/            # Board-related components
│   │   ├── tasks/            # Task-related components
│   │   └── common/           # Shared components
│   ├── providers/            # React context providers
│   ├── services/            # Service layer
│   ├── styles/             # Global styles
│   ├── types/              # TypeScript type definitions
│   └── hooks/             # Custom React hooks
├── README.md
└── package.json
```

## Features

- Real-time updates using WebSocket
- Drag and drop task management
- Responsive design
- Form validation
- Error handling and boundaries
- TypeScript type safety
- SCSS modules for component styling
- API route handlers for backend communication

## Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.development.local
```

3. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Environment Variables

```env
# API Configuration
NEXT_API_URL=http://localhost:4000 # Backend API URL
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:4000 # WebSocket URL
```

## Docker Support

The application includes Docker configuration for development:
- Hot-reload enabled
- Volume mounting for real-time code changes
- Optimized for development workflow

To run with Docker:
```bash
docker build -t frontend .
docker run -p 3000:3000 frontend
```

## Key Components

### Board
- Manages overall board state
- Handles WebSocket connections
- Provides context for child components

### Column
- Displays tasks in a column
- Handles drag and drop interactions
- Manages task ordering

### TaskCard
- Individual task display
- Drag and drop functionality
- Edit and delete actions

### TaskForm
- Task creation and editing
- Form validation
- Error handling

## State Management

The application uses React Context (BoardProvider) for state management, featuring:
- Real-time updates via WebSocket
- Optimistic updates for better UX
- Error handling and recovery
- Type-safe state management

## License

[MIT License](LICENSE)
