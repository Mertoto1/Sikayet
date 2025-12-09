import { z } from 'zod'

export const loginSchema = z.object({
    email: z.string().email('Geçersiz e-posta adresi'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır')
})

export const registerSchema = z.object({
    name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
    surname: z.string().min(2, 'Soyisim en az 2 karakter olmalıdır'),
    username: z.string().min(3, 'Kullanıcı adı en az 3 karakter olmalıdır'),
    email: z.string().email('Geçerli bir email adresi giriniz'),
    password: z.string().min(6, 'Parola en az 6 karakter olmalıdır'),
    confirmPassword: z.string(),
    phone: z.string().min(10, 'Geçerli bir telefon numarası giriniz').optional()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Parolalar eşleşmiyor",
    path: ["confirmPassword"],
})

export const complaintSchema = z.object({
    title: z.string().min(5, 'Başlık en az 5 karakter olmalıdır').max(100, 'Başlık çok uzun'),
    content: z.string().min(20, 'Şikayet detayı en az 20 karakter olmalıdır'),
    companyId: z.string(), // Will be converted to number in API
    images: z.array(z.string()).optional()
})

export const reviewSchema = z.object({
    rating: z.number().min(1).max(5),
    message: z.string().optional()
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ComplaintInput = z.infer<typeof complaintSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
