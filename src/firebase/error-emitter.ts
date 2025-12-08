
import { EventEmitter } from 'events';

// This is a simple event emitter to broadcast Firestore permission errors.
export const errorEmitter = new EventEmitter();
