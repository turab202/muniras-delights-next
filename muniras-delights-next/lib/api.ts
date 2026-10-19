import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  slug: z.string().min(2, 'Slug is required'),
  sort_order: z.number().int().min(0).optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().min(10, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  category_id: z.number().int().nullable().optional(),
  image_url: z.string().url('Image URL must be valid').or(z.literal('')).optional(),
  is_featured: z.boolean().optional(),
  is_available: z.boolean().optional(),
  is_promo: z.boolean().optional(),
});

export const adminLoginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});
