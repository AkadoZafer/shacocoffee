import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const ERROR_COLLECTION = 'error_logs';
const SOURCE = 'app';
const DEDUP_WINDOW_MS = 120000;

let currentUserId = null;
let isWritingLog = false;
const recentErrorMap = new Map();

const toSafeString = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (value instanceof Error) return value.message || '';
    try {
        return JSON.stringify(value);
    } catch (_) {
        return String(value);
    }
};

const normalizeSeverity = (severity) => (severity === 'warning' ? 'warning' : 'error');

const makeErrorSignature = ({ severity, message, stack, route }) => {
    const normalizedMessage = toSafeString(message).slice(0, 240);
    const normalizedStack = toSafeString(stack).slice(0, 400);
    const normalizedRoute = toSafeString(route).slice(0, 120);
    return `${normalizeSeverity(severity)}|${normalizedMessage}|${normalizedStack}|${normalizedRoute}`;
};

const shouldSkipByDedup = (signature) => {
    const now = Date.now();
    const lastSeen = recentErrorMap.get(signature);
    if (lastSeen && now - lastSeen < DEDUP_WINDOW_MS) {
        return true;
    }

    recentErrorMap.set(signature, now);
    if (recentErrorMap.size > 400) {
        for (const [key, ts] of recentErrorMap.entries()) {
            if (now - ts > DEDUP_WINDOW_MS) {
                recentErrorMap.delete(key);
            }
        }
    }
    return false;
};

export const setErrorTrackingUser = (userId) => {
    currentUserId = userId || null;
};

export const logClientError = async ({
    severity = 'error',
    message,
    stack,
    route
}) => {
    if (isWritingLog) return;
    const signature = makeErrorSignature({ severity, message, stack, route });
    if (shouldSkipByDedup(signature)) return;

    const payload = {
        source: SOURCE,
        severity: normalizeSeverity(severity),
        message: toSafeString(message).slice(0, 2000),
        stack: toSafeString(stack).slice(0, 12000),
        route: route || window.location?.pathname || '',
        userId: currentUserId,
        userAgent: navigator.userAgent || '',
        appVersion: import.meta.env.VITE_APP_VERSION || 'unknown',
        createdAt: serverTimestamp(),
        resolved: false
    };

    try {
        isWritingLog = true;
        await addDoc(collection(db, ERROR_COLLECTION), payload);
    } catch (error) {
        // Never throw from error tracking path.
        console.error('Error tracking write failed:', error);
    } finally {
        isWritingLog = false;
    }
};
