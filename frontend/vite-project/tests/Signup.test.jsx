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

import Signup from '../src/Signup';

function renderSignup() {
    return render(
        <MemoryRouter>
            <Signup onSignup={() => { }} />
        </MemoryRouter>
    );
}

/**
 * COMPONENT TEST 2: Signup component renders correctly
 */
describe('Signup Component', () => {
    test('renders create account heading and all form fields', () => {
        renderSignup();

        expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    test('renders submit button', () => {
        renderSignup();

        const button = screen.getByRole('button', { name: /create account/i });
        expect(button).toBeInTheDocument();
        expect(button).not.toBeDisabled();
    });

    test('renders login link for existing users', () => {
        renderSignup();

        expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
        expect(screen.getByText('Sign in')).toBeInTheDocument();
    });
});
