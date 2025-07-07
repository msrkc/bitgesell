import React, { createContext, useCallback, useContext, useState } from 'react';
import { generateMockItems } from '../utils/mockData';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate mock data for testing large lists
  const generateMockData = useCallback((count = 1000) => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const mockItems = generateMockItems(count);
      setItems(mockItems);
      setLoading(false);
    }, 500);
  }, []);

  const fetchWithOffset = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });

      const url = searchParams.toString() ? `http://localhost:3001/api/items?${searchParams.toString()}` : 'http://localhost:3001/api/items';

      console.log('Fetching with offset:', url);

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      console.log('Received items with offset:', json.length);

      setItems(json);
      return json;
    } catch (err) {
      console.error('Error fetching items with offset:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <DataContext.Provider
      value={{
        items,
        loading,
        error,
        fetchWithOffset,
        generateMockData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
