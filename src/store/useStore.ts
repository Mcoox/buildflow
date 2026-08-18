import { useCallback, useEffect, useState } from 'react'
import { seedData } from '../data/seed'
import type { AppData } from '../types'

const STORAGE_KEY = 'buildflow-data-v2'

function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored) as AppData
  } catch {
    // fall through to seed
  }
  return seedData
}

function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function useStore() {
  const [data, setData] = useState<AppData>(loadData)

  useEffect(() => {
    saveData(data)
  }, [data])

  const update = useCallback((updater: (prev: AppData) => AppData) => {
    setData((prev) => updater(prev))
  }, [])

  const reset = useCallback(() => {
    setData(seedData)
  }, [])

  return { data, update, reset }
}

export type Store = ReturnType<typeof useStore>
