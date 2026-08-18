import { useCallback, useEffect, useState } from 'react'
import { seedData } from '../data/seed'
import type { AppData } from '../types'

const STORAGE_KEY = 'buildflow-data-v4'
const LEGACY_KEYS = ['buildflow-data-v3', 'buildflow-data-v2', 'buildflow-data']

function mergeWithSeed(parsed: Partial<AppData>): AppData {
  const company = {
    ...seedData.company,
    ...parsed.company,
    tagline: parsed.company?.tagline ?? seedData.company.tagline,
    website: parsed.company?.website ?? seedData.company.website,
    logoUrl: parsed.company?.logoUrl ?? seedData.company.logoUrl,
  }
  return {
    ...seedData,
    ...parsed,
    company,
    users: parsed.users ?? seedData.users,
    customers: parsed.customers ?? seedData.customers,
    quotes: parsed.quotes ?? seedData.quotes,
    invoices: parsed.invoices ?? seedData.invoices,
    projects: parsed.projects ?? seedData.projects,
    employees: parsed.employees ?? seedData.employees,
    timeOffRequests: parsed.timeOffRequests ?? seedData.timeOffRequests,
    suppliers: parsed.suppliers ?? seedData.suppliers,
    inventory: parsed.inventory ?? seedData.inventory,
    assets: parsed.assets ?? seedData.assets,
  }
}

function loadData(): AppData {
  for (const key of [STORAGE_KEY, ...LEGACY_KEYS]) {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        return mergeWithSeed(JSON.parse(stored) as Partial<AppData>)
      }
    } catch {
      // try next key
    }
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
