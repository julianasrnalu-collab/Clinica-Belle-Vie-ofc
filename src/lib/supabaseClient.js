import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vnygxmtoloxcvsoimchr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZueWd4bXRvbG94Y3Zzb2ltY2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MjYwNDYsImV4cCI6MjA5ODAwMjA0Nn0.ROVWVJfWEqS7C_8QQra1RADeeSeS0XVO5Ny8dxd-3bs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
