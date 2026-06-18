

const supabaseUrl = 'https://mkmpljmpdizbhokjmkow.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbXBsam1wZGl6Ymhva2pta293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NTQ5NDgsImV4cCI6MjA5NjMzMDk0OH0.TrMmfS9DzXAO9IPYzLpMIR_LCEHFCn6PpUcCCEURyTY';


window.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase инициализирован глобально');