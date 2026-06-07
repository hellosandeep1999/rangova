require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  console.log("Fetching first row of each table to understand schema...");
  
  const tables = ['products', 'orders', 'customers', 'categories'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Error fetching ${table}:`, error.message);
    } else {
      console.log(`--- ${table} ---`);
      if (data && data.length > 0) {
        console.log(Object.keys(data[0]));
        console.log(JSON.stringify(data[0], null, 2));
      } else {
        console.log(`Table ${table} is empty.`);
      }
    }
  }
}

run();
