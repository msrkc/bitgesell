import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

function VirtualizedItems() {
  const { items, fetchWithOffset, generateMockData, loading } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [useMockData, setUseMockData] = useState(false);
  const [offset, setOffset] = useState(0);

  // Reference to the scrollable container
  const parentRef = useRef();

  // Dynamic limit based on data source
  const limit = useMockData ? 500 : 3;

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!debouncedSearchQuery) return items;

    return items.filter((item) => item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) || item.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
  }, [items, debouncedSearchQuery]);

  // TanStack Virtual configuration
  const virtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Estimated height of each item in pixels
    overscan: 5, // Number of items to render outside of the visible area
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset offset when search changes or data source changes
  useEffect(() => {
    setOffset(0);
  }, [debouncedSearchQuery, useMockData]);

  // Fetch data when component mounts or search changes
  useEffect(() => {
    let active = true;
    // i would use AbortController for more modern approach
    // react query in production

    if (useMockData) {
      generateMockData(1000);
      return;
    }

    const safeFetch = async () => {
      try {
        await fetchWithOffset({
          limit,
          offset,
          q: debouncedSearchQuery,
        });
      } catch (err) {
        if (active) {
          console.error(err);
        }
      }
    };

    safeFetch();

    return () => {
      active = false;
    };
  }, [fetchWithOffset, debouncedSearchQuery, useMockData, generateMockData, limit, offset]);

  // Pagination handlers
  const loadMore = () => {
    if (!useMockData) {
      setOffset((prev) => prev + limit);
    }
  };

  const loadPrevious = () => {
    if (!useMockData) {
      setOffset((prev) => Math.max(0, prev - limit));
    }
  };

  if (loading && !items.length) return <p>Loading...</p>;

  return (
    <div style={{ padding: '20px' }}>
      {/* Controls */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <button
            onClick={() => setUseMockData(!useMockData)}
            style={{
              padding: '8px 16px',
              backgroundColor: useMockData ? '#28a745' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px',
            }}
          >
            {useMockData ? 'Using Mock Data (500/page)' : 'Use Mock Data'}
          </button>

          {useMockData && (
            <button
              onClick={() => generateMockData(5000)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Generate 5000 Items
            </button>
          )}
        </div>

        {/* Search input */}
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '300px',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
        />
      </div>

      {/* Results info */}
      <p style={{ marginBottom: '10px' }}>
        Showing {filteredItems.length} items
        {!useMockData && ` (${limit} per page, offset: ${offset})`}
        {debouncedSearchQuery && ` for "${debouncedSearchQuery}"`}
        {loading && ' (Loading...)'}
      </p>

      {/* Pagination controls for API data */}
      {!useMockData && (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <button
            onClick={loadPrevious}
            disabled={offset === 0 || loading}
            style={{
              padding: '8px 16px',
              marginRight: '10px',
              backgroundColor: offset === 0 || loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: offset === 0 || loading ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
          </button>

          <span style={{ margin: '0 15px', fontSize: '14px', color: '#666' }}>Page {Math.floor(offset / limit) + 1}</span>

          <button
            onClick={loadMore}
            disabled={items.length < limit || loading}
            style={{
              padding: '8px 16px',
              backgroundColor: items.length < limit || loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: items.length < limit || loading ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Virtualized list container */}
      <div
        ref={parentRef}
        style={{
          height: '600px', // Fixed height for virtualization
          overflow: 'auto',
          border: '1px solid #ddd',
          borderRadius: '4px',
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = filteredItems[virtualItem.index];

            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                  padding: '10px 15px',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: virtualItem.index % 2 === 0 ? '#f9f9f9' : 'white',
                }}
              >
                <div style={{ flex: 1 }}>
                  <Link
                    to={`/items/${item.id}`}
                    style={{
                      textDecoration: 'none',
                      color: '#007bff',
                      fontWeight: '500',
                    }}
                  >
                    {item.name}
                  </Link>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#666',
                      marginTop: '2px',
                    }}
                  >
                    {item.category}
                  </div>
                </div>
                <div
                  style={{
                    fontWeight: 'bold',
                    color: '#28a745',
                    minWidth: '80px',
                    textAlign: 'right',
                  }}
                >
                  ${item.price}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Virtualization stats */}
      <div
        style={{
          marginTop: '10px',
          fontSize: '12px',
          color: '#666',
        }}
      >
        <p>
          Rendering {virtualizer.getVirtualItems().length} of {filteredItems.length} items (Virtualization active - {useMockData ? 'Mock data mode' : 'API data mode'})
        </p>
      </div>
    </div>
  );
}

export default VirtualizedItems;
