import { z } from 'zod';
import type { CreateBattleRequest, UpdateBattleRequest, VoteRequest } from '~/types';

export const battleSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters'),
  options: z.array(
    z.string().trim()
  )
  .transform(options => options.filter(option => option.trim().length > 0))
  .refine(options => options.length >= 2, {
    message: 'At least 2 non-empty options are required'
  })
}) satisfies z.ZodType<CreateBattleRequest>;

  
  export const updateBattleSchema = z.object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters'),
    options: z.array(z.object({
      id: z.string().optional(),
      content: z.string().trim().min(1, 'Option cannot be empty').max(100, 'Option must be at most 100 characters')
    })).min(2, `At least 2 options are required`)
  }) satisfies z.ZodType<UpdateBattleRequest>;
  
  export const voteSchema = z.object({
    winnerId: z.string().uuid('Invalid winner ID'),
    loserId: z.string().uuid('Invalid loser ID')
  }) satisfies z.ZodType<VoteRequest>;