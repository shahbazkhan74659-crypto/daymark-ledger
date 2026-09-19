import { useEffect, useState } from 'react'

console.log('VITE_APP_NAME:', import.meta.env.VITE_APP_NAME)

type DbCheckResponse = {
  status: string
  dbTime: string | null
}

function App() {
  const [data, setData] = useState<DbCheckResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/db-check')
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        return res.json() as Promise<DbCheckResponse>
      })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
  }, [])

  return (
    <div className="min-h-screen w-full bg-white p-4">
      {error && <p>Error: {error}</p>}
      {!error && !data && <p>Loading...</p>}
      {data && (
        <p>
          Backend status: {data.status} — DB time: {data.dbTime}
        </p>
      )}
    </div>
  )
}

export default App
