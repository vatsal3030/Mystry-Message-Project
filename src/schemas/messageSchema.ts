import {z} from 'zod'

export const MessageSchema = z.object({
    content: z.string ().min(10, {message: 'Message content at least 10 characters long'}).max(300, {message: 'Message content at most 300 characters long'}),
})