// src/pages/test-rpc.tsx
import { useEffect, useState } from 'react'

import { initializeProviders } from 'src/repositories/RpcProvider'

interface TestResults {
  success: boolean
  duration?: number
  providers?: {
    gnosisUrl: string
    ethereumUrl: string
  }
  error?: {
    message: string
    stack: string
  }
}

export default function TestRpcPage() {
  const [results, setResults] = useState<TestResults | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    testInitializeProviders()
  }, [])

  const testInitializeProviders = async () => {
    try {
      console.log('🚀 Test de initializeProviders...')

      const startTime = Date.now()
      const providers = await initializeProviders()
      const duration = Date.now() - startTime

      setResults({
        success: true,
        duration,
        providers: {
          gnosisUrl: providers.GnosisRpcUrl,
          ethereumUrl: providers.EthereumRpcUrl,
        },
      })

      console.log('✅ initializeProviders réussi:', providers)
    } catch (error) {
      console.error('❌ initializeProviders échoué:', error)
      setResults({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Erreur inconnue',
          stack: error instanceof Error ? error.stack || '' : '',
        },
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Test RPC - Chargement...</h1>
        <p>Test de initializeProviders en cours...</p>
      </div>
    )
  }

  if (!results?.success) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Test RPC - Erreur</h1>
        <h2>❌ initializeProviders a échoué</h2>
        <p>
          <strong>Message:</strong> {results?.error?.message}
        </p>
        <details>
          <summary>Stack trace</summary>
          <pre
            style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}
          >
            {results?.error?.stack}
          </pre>
        </details>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test RPC - Succès</h1>
      <h2>✅ initializeProviders réussi</h2>
      <p>
        <strong>Durée:</strong> {results.duration}ms
      </p>
      <p>
        <strong>Gnosis RPC:</strong> {results.providers?.gnosisUrl}
      </p>
      <p>
        <strong>Ethereum RPC:</strong> {results.providers?.ethereumUrl}
      </p>
    </div>
  )
}
