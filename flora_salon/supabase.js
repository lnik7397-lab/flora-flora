// supabase.js
// Убедитесь, что URL правильный - без /rest/v1/ в конце!
const SUPABASE_URL = 'https://mkmpljmpdizbhokjmkow.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rbXBsam1wZGl6Ymhva2pta293Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NTQ5NDgsImV4cCI6MjA5NjMzMDk0OH0.TrMmfS9DzXAO9IPYzLpMIR_LCEHFCn6PpUcCCEURyTY';

// Создаём клиент
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Делаем глобальным
window.supabase = supabaseClient;

console.log('Supabase инициализирован:', window.supabase);