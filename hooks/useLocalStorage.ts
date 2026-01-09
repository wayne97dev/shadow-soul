import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with React state
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get initial value from localStorage or use default
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setStoredValue, removeValue];
}

/**
 * Hook for managing deposit notes
 */
export interface DepositNote {
  id: string;
  secret: string;
  nullifier: string;
  commitment: string;
  amount: number;
  timestamp: number;
  withdrawn: boolean;
}

export function useDepositNotes() {
  const [notes, setNotes, clearNotes] = useLocalStorage<DepositNote[]>('shadow-soul-notes', []);

  const addNote = useCallback((note: Omit<DepositNote, 'id' | 'timestamp' | 'withdrawn'>) => {
    const newNote: DepositNote = {
      ...note,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      withdrawn: false,
    };
    setNotes(prev => [...prev, newNote]);
    return newNote;
  }, [setNotes]);

  const markWithdrawn = useCallback((id: string) => {
    setNotes(prev => prev.map(note => 
      note.id === id ? { ...note, withdrawn: true } : note
    ));
  }, [setNotes]);

  const removeNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  }, [setNotes]);

  const getActiveNotes = useCallback(() => {
    return notes.filter(note => !note.withdrawn);
  }, [notes]);

  return {
    notes,
    addNote,
    markWithdrawn,
    removeNote,
    getActiveNotes,
    clearNotes,
  };
}

/**
 * Hook for managing stealth meta-address
 */
export interface StealthMetaAddress {
  spendPubkey: string;
  spendPrivkey: string;
  viewPubkey: string;
  viewPrivkey: string;
  metaAddress: string;
}

export function useStealthAddress() {
  const [metaAddress, setMetaAddress, clearMetaAddress] = useLocalStorage<StealthMetaAddress | null>(
    'shadow-soul-stealth',
    null
  );

  return {
    metaAddress,
    setMetaAddress,
    clearMetaAddress,
    hasMetaAddress: metaAddress !== null,
  };
}

/**
 * Hook for managing identity
 */
export interface Identity {
  secret: string;
  nullifier: string;
  commitment: string;
  registered: boolean;
  registeredAt?: number;
}

export function useIdentity() {
  const [identity, setIdentity, clearIdentity] = useLocalStorage<Identity | null>(
    'shadow-soul-identity',
    null
  );

  const register = useCallback((id: Omit<Identity, 'registered' | 'registeredAt'>) => {
    setIdentity({
      ...id,
      registered: true,
      registeredAt: Date.now(),
    });
  }, [setIdentity]);

  return {
    identity,
    register,
    clearIdentity,
    isRegistered: identity?.registered ?? false,
  };
}
