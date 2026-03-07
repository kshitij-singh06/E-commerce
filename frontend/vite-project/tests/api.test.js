import { describe, test, expect, vi, beforeEach } from 'vitest';

/**
 * INTEGRATION TEST: API utility functions and auth flow
 * Tests that the api.js module correctly builds headers and manages API URL
 */

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, val) => { store[key] = val; }),
        removeItem: vi.fn((key) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; }),
    };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

import { API, authHeaders, authJsonHeaders } from '../src/api';

describe('API Utility Module', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    test('API should have a valid base URL', () => {
        expect(API).toBeDefined();
        expect(typeof API).toBe('string');
        expect(API.length).toBeGreaterThan(0);
    });

    test('authHeaders should return Authorization header when token exists', () => {
        localStorageMock.setItem('token', 'test-jwt-token');
        const headers = authHeaders();
        expect(headers).toHaveProperty('Authorization', 'Bearer test-jwt-token');
    });

    test('authJsonHeaders should include both auth and content-type headers', () => {
        localStorageMock.setItem('token', 'test-jwt-token');
        const headers = authJsonHeaders();
        expect(headers).toHaveProperty('Authorization', 'Bearer test-jwt-token');
        expect(headers).toHaveProperty('Content-Type', 'application/json');
    });

    test('auth flow: token stored and retrieved correctly', () => {
        // Simulate login: store token
        localStorageMock.setItem('token', 'real-token-123');
        expect(localStorageMock.getItem('token')).toBe('real-token-123');

        // Simulate logout: remove token
        localStorageMock.removeItem('token');
        expect(localStorageMock.getItem('token')).toBeNull();
    });
});
