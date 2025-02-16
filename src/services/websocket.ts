import { io, Socket } from 'socket.io-client';
import { Task, Column } from '@/types';

interface ServerToClientEvents {
  'task:updated': (task: Task) => void;
  'task:created': (task: Task) => void;
  'task:deleted': (taskId: string, columnId: string) => void;
  'task:moved': (task: Task) => void;
  'column:updated': (column: Column) => void;
}

interface ClientToServerEvents {
  'task:update': (task: Task) => void;
  'task:create': (task: Partial<Task>) => void;
  'task:delete': (taskId: string, columnId: string) => void;
  'task:move': (taskId: string, targetColumnId: string, order: number) => void;
  'column:update': (column: Column) => void;
}

class WebSocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect() {
    if (this.socket?.connected) return;

    const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://backend:4000';
    
    this.socket = io(SOCKET_URL, {
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

    this.socket.on('connect_error', (error) => {
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

  // Methods to emit events to the server
  updateTask(task: Task) {
    this.socket?.emit('task:update', task);
  }

  createTask(task: Partial<Task>) {
    this.socket?.emit('task:create', task);
  }

  deleteTask(taskId: string, columnId: string) {
    this.socket?.emit('task:delete', taskId, columnId);
  }

  moveTask(taskId: string, targetColumnId: string, order: number) {
    this.socket?.emit('task:move', taskId, targetColumnId, order);
  }

  updateColumn(column: Column) {
    this.socket?.emit('column:update', column);
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, ...args: any[]) {
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