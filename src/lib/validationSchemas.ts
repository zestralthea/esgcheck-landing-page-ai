import { z } from 'zod';

// Waitlist validation schema
export const waitlistSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  company: z.string()
    .max(100, 'Company name must be less than 100 characters')
    .optional()
    .refine((val) => !val || /^[a-zA-Z0-9\s\-&.,()]+$/.test(val), {
      message: 'Company name contains invalid characters'
    })
});

// Authentication validation schemas
export const signInSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
});

export const signUpSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  fullName: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes')
});

// ESG Upload validation schema
export const esgUploadSchema = z.object({
  reportTitle: z.string()
    .min(1, 'Report title is required')
    .max(200, 'Report title must be less than 200 characters')
    .regex(/^[a-zA-Z0-9\s\-_.,()]+$/, 'Report title contains invalid characters'),
  reportType: z.string()
    .min(1, 'Report type is required'),
  reportingPeriodStart: z.string()
    .min(1, 'Reporting period start date is required'),
  reportingPeriodEnd: z.string()
    .min(1, 'Reporting period end date is required'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  griStandards: z.array(z.string()).optional(),
  file: z.instanceof(File)
    .refine((file) => file.size <= 50 * 1024 * 1024, 'File size must be less than 50MB')
    .refine((file) => {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'text/plain'
      ];
      return allowedTypes.includes(file.type);
    }, 'Invalid file type. Only PDF, Word, Excel, CSV, and text files are allowed')
});

// Contact form validation schema
export const contactSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  company: z.string()
    .max(100, 'Company name must be less than 100 characters')
    .optional(),
  message: z.string()
    .min(1, 'Message is required')
    .max(2000, 'Message must be less than 2000 characters')
    .regex(/^[a-zA-Z0-9\s\-_.,()!?'"@#$%&*+=/<>{}[\]|\\]+$/, 'Message contains invalid characters')
});

// Profile update validation schema
export const profileUpdateSchema = z.object({
  fullName: z.string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Full name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters')
});

// Input sanitization helper
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potentially dangerous HTML characters
    .substring(0, 1000); // Limit length as additional safety
};

export type WaitlistFormData = z.infer<typeof waitlistSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ESGUploadFormData = z.infer<typeof esgUploadSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;