import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock heavy MUI icons module to avoid EMFILE
vi.mock('@mui/icons-material', () => ({
    Visibility: () => 'VisibilityIcon',
    VisibilityOff: () => 'VisibilityOffIcon',
}));

// Mock the App module
vi.mock('../src/App', () => {
    const { createContext } = require('react');
    return {
        ToastContext: createContext(() => { }),
        CartContext: createContext({ cartCount: 0, refreshCart: () => { } }),
    };
});

import Login from '../src/Login';

function renderLogin() {
    return render(
        <MemoryRouter>
            <Login onLogin={() => { }} />
        </MemoryRouter>
    );
}

/**
 * COMPONENT TEST 1: Login component renders correctly
 */
describe('Login Component', () => {
    test('renders sign in heading and form fields', () => {
        renderLogin();

        expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    test('renders submit button that is enabled', () => {
        renderLogin();

        const button = screen.getByRole('button', { name: /sign in/i });
        expect(button).toBeInTheDocument();
        expect(button).not.toBeDisabled();
    });

    test('renders signup link for new users', () => {
        renderLogin();

        expect(screen.getByText('Sign up')).toBeInTheDocument();
        expect(screen.getByText(/no account/i)).toBeInTheDocument();
    });

    test('renders demo credentials box', () => {
        renderLogin();

        expect(screen.getByText(/admin@demo.com/i)).toBeInTheDocument();
    });
});
