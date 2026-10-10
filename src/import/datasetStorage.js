/**
 * SupplyShield AI — Uploaded Dataset Storage & Persistence
 * 
 * Safely persists and recovers uploaded vendor datasets in localStorage
 * with corruption safeguards, schema validation, and dataset mode switching.
 */

export const UPLOADED_DATASET_STORAGE_KEY = 'supplyshield_uploaded_dataset_v2';
export const ACTIVE_DATASET_MODE_KEY = 'supplyshield_active_dataset_mode_v2';

export const DATASET_MODE = {
  DEMO: 'demo',
  UPLOADED: 'uploaded'
};

/**
 * Load persisted uploaded dataset with schema validation
 */
export function loadPersistedUploadedDataset() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(UPLOADED_DATASET_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      window.localStorage.removeItem(UPLOADED_DATASET_STORAGE_KEY);
      return null;
    }

    if (!Array.isArray(parsed.suppliers) || parsed.suppliers.length === 0) {
      window.localStorage.removeItem(UPLOADED_DATASET_STORAGE_KEY);
      return null;
    }

    // Verify minimum entity structure
    const first = parsed.suppliers[0];
    if (!first.id || !first.name || typeof first.riskScore !== 'number') {
      window.localStorage.removeItem(UPLOADED_DATASET_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch (err) {
    console.warn('SupplyShield: Corrupted uploaded dataset in localStorage. Resetting to null.', err);
    try {
      window.localStorage.removeItem(UPLOADED_DATASET_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
    return null;
  }
}

/**
 * Save uploaded dataset safely
 */
export function savePersistedUploadedDataset(dataset) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    if (!dataset || !Array.isArray(dataset.suppliers) || dataset.suppliers.length === 0) {
      window.localStorage.removeItem(UPLOADED_DATASET_STORAGE_KEY);
      return true;
    }

    const serialized = JSON.stringify({
      version: '2.0.0',
      savedAt: new Date().toISOString(),
      meta: dataset.meta || {},
      suppliers: dataset.suppliers,
      rawRowCount: dataset.rawRowCount || dataset.suppliers.length,
      analyzedCount: dataset.suppliers.length
    });

    window.localStorage.setItem(UPLOADED_DATASET_STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    console.error('SupplyShield: Failed to persist uploaded dataset to localStorage:', err);
    return false;
  }
}

/**
 * Clear uploaded dataset from localStorage
 */
export function clearPersistedUploadedDataset() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.removeItem(UPLOADED_DATASET_STORAGE_KEY);
    window.localStorage.setItem(ACTIVE_DATASET_MODE_KEY, DATASET_MODE.DEMO);
  } catch (err) {
    console.error('SupplyShield: Error clearing uploaded dataset:', err);
  }
}

/**
 * Load active dataset mode ('demo' or 'uploaded')
 */
export function loadActiveDatasetMode() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DATASET_MODE.DEMO;
  }

  try {
    const mode = window.localStorage.getItem(ACTIVE_DATASET_MODE_KEY);
    if (mode === DATASET_MODE.UPLOADED) {
      // Verify that uploaded dataset actually exists
      const uploaded = loadPersistedUploadedDataset();
      if (uploaded && uploaded.suppliers && uploaded.suppliers.length > 0) {
        return DATASET_MODE.UPLOADED;
      }
    }
    return DATASET_MODE.DEMO;
  } catch {
    return DATASET_MODE.DEMO;
  }
}

/**
 * Save active dataset mode
 */
export function saveActiveDatasetMode(mode) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    window.localStorage.setItem(ACTIVE_DATASET_MODE_KEY, mode === DATASET_MODE.UPLOADED ? DATASET_MODE.UPLOADED : DATASET_MODE.DEMO);
  } catch (err) {
    console.error('SupplyShield: Error saving active dataset mode:', err);
  }
}
