import { io, Socket } from 'socket.io-client';
import { Task, Column } from '@/types';

interface ServerToClientEvents {
  'task:updated': (task: Task) => void;
  'task:created': (task: Task) => void;
  'task:deleted': (taskId: string, columnId: string) => void;
  'task:moved': (task: Task) => void;
  'column:updated': (column: Column) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventCallback = (...args: any[]) => void;

class WebSocketService {
  private socket: Socket<ServerToClientEvents> | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();

  connect() {
    if (this.socket?.connected) return;

    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

    this.socket = io(wsUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('WebSocket connection error:', error);
    });

    // Setup task event listeners
    this.socket.on('task:updated', (task) => {
      this.emit('task:updated', task);
    });

    this.socket.on('task:created', (task) => {
      this.emit('task:created', task);
    });

    this.socket.on('task:deleted', (taskId, columnId) => {
      this.emit('task:deleted', taskId, columnId);
    });

    this.socket.on('task:moved', (task) => {
      this.emit('task:moved', task);
    });

    this.socket.on('column:updated', (column) => {
      this.emit('column:updated', column);
    });
  }

  on(event: keyof ServerToClientEvents, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: keyof ServerToClientEvents, callback: EventCallback) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: keyof ServerToClientEvents, ...args: unknown[]) {
    this.listeners.get(event)?.forEach(callback => {
      callback(...args);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.listeners.clear();
  }
}

// Create a singleton instance
export const websocketService = new WebSocketService(); 