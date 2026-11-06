import { useState, useCallback } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

/**
 * Custom React hook to execute an async API call with loading and error state management.
 *
 * @example
 * ```tsx
 * const { data, loading, error, execute } = useApi(apiHandler.getStreams)
 * useEffect(() => { execute() }, [execute])
 * ```
 */
export function useApi<T, P extends unknown[] = unknown[]>(apiFn: (...args: P) => Promise<T>) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: P): Promise<T> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const result = await apiFn(...args)
        setState({ data: result, loading: false, error: null })
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setState((prev) => ({ ...prev, loading: false, error }))
        throw error
      }
    },
    [apiFn]
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}

export default useApi

