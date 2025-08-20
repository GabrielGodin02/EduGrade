import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iltkzdkfkjcgvinjcdes.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsdGt6ZGtma2pjZ3ZpbmpjZGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4NDk4MjYsImV4cCI6MjA2OTQyNTgyNn0._Y-rH_drNCkypgvfytmRNm5qt4hHREP4rl26A6r3k-8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);