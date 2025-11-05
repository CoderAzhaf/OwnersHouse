import { useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.from('pg_tables').select('*')
      if (error) console.error('❌ Supabase Error:', error)
      else console.log('✅ Supabase Connected!', data)
    }
    testConnection()
  }, [])

  return <h1>Testing Supabase...</h1>
}

export default App
