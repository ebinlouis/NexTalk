import { z } from 'zod';

export const signupSchema = z.object({
    body: z.object({
        fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(50, 'Full name cannot exceed 50 characters'),
        email: z.string().trim().email('Invalid email address format').toLowerCase(),
        password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password cannot exceed 100 characters'),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().trim().email('Invalid email address format').toLowerCase(),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const updateProfileSchema = z.object({
    body: z.object({
        fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(50, 'Full name cannot exceed 50 characters').optional(),
        bio: z.string().trim().max(150, 'Bio cannot exceed 150 characters').optional(),
        status: z.enum(['available', 'busy', 'away']).optional(),
    }),
});