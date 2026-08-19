import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ufsqavndpjphowuacxfi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmc3Fhdm5kcGpwaG93dWFjeGZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMTM4NzgsImV4cCI6MjA5NjY4OTg3OH0.fpaVZY8i7YQLRewcv3cuEZR_P9wNz1rWs5Q1UOk3Hz0';
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('personnel').select('*');
  console.log("Personnel:", data);
  if (error) console.error("Error:", error);
}

test();
