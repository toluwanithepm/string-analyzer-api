-- Run this in Supabase SQL Editor or via psql
CREATE TABLE IF NOT EXISTS public.strings (
  id varchar(64) PRIMARY KEY,
  value text NOT NULL,
  length integer,
  is_palindrome boolean,
  unique_characters integer,
  word_count integer,
  sha256_hash varchar(64),
  character_frequency_map jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_strings_value ON public.strings (value);
CREATE INDEX IF NOT EXISTS idx_strings_is_palindrome ON public.strings (is_palindrome);
CREATE INDEX IF NOT EXISTS idx_strings_length ON public.strings (length);
CREATE INDEX IF NOT EXISTS idx_strings_word_count ON public.strings (word_count);
