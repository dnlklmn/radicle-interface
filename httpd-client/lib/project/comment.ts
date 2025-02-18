import type { ZodSchema } from "zod";
import { array, number, object, string, tuple } from "zod";

export type ThreadUpdateAction =
  | { type: "comment"; body: string; replyTo?: string }
  | { type: "edit"; id: string; body: string }
  | { type: "redact"; id: string }
  | {
      type: "react";
      to: string;
      reaction: { emoji: string };
      active: boolean;
    };

export interface Comment {
  id: string;
  author: { id: string; alias?: string };
  body: string;
  reactions: [string, string][];
  timestamp: number;
  replyTo: string | null;
}

export const commentSchema = object({
  id: string(),
  author: object({ id: string(), alias: string().optional() }),
  body: string(),
  reactions: array(tuple([string(), string()])),
  timestamp: number(),
  replyTo: string().nullable(),
}) satisfies ZodSchema<Comment>;
