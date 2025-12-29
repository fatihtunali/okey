import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta gerekli')
    .email('Geçerli bir e-posta adresi girin'),
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermeli')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermeli'),
  name: z
    .string()
    .min(2, 'İsim en az 2 karakter olmalı')
    .max(50, 'İsim en fazla 50 karakter olabilir'),
  locale: z.enum(['tr', 'en']).optional().default('tr'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta gerekli')
    .email('Geçerli bir e-posta adresi girin'),
  password: z
    .string()
    .min(1, 'Şifre gerekli'),
});

export const phoneCodeSchema = z.object({
  phone: z
    .string()
    .min(10, 'Geçerli bir telefon numarası girin')
    .regex(/^\+?[0-9]+$/, 'Geçerli bir telefon numarası girin'),
});

export const phoneVerifySchema = z.object({
  phone: z
    .string()
    .min(10, 'Geçerli bir telefon numarası girin'),
  code: z
    .string()
    .length(6, 'Doğrulama kodu 6 haneli olmalı'),
});

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'İsim en az 2 karakter olmalı')
    .max(50, 'İsim en fazla 50 karakter olabilir')
    .optional(),
  locale: z.enum(['tr', 'en']).optional(),
  avatarId: z.string().optional(),
  tileThemeId: z.string().optional(),
  tableThemeId: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PhoneCodeInput = z.infer<typeof phoneCodeSchema>;
export type PhoneVerifyInput = z.infer<typeof phoneVerifySchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
