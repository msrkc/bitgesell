import React, { useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

function Items() {
  const { items, fetchWithOffset } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(3);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let active = true;
    // i would use AbortController for more modern approach
    // react query in production

    // Wrap fetchWithOffset to only update state if still mounted / active
    const safeFetch = async () => {
      try {
        setLoading(true);
        await fetchWithOffset({
          offset,
          limit,
          q: debouncedSearchQuery,
        });
      } catch (err) {
        if (active) {
          console.error(err);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    safeFetch();

    return () => {
      active = false;
    };
  }, [fetchWithOffset, debouncedSearchQuery, offset, limit]);

  // Reset offset when search changes
  useEffect(() => {
    setOffset(0);
  }, [debouncedSearchQuery]);

  const loadMore = () => {
    setOffset((prev) => prev + limit);
  };

  const loadPrevious = () => {
    setOffset((prev) => Math.max(0, prev - limit));
  };

  if (loading && !items.length) return <p>Loading...</p>;

  return (
    <div>
      {/* Search input */}
      <input
        type="text"
        placeholder="Search items..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: '300px',
          padding: '8px',
          marginBottom: '20px',
          border: '1px solid #ddd',
          borderRadius: '4px',
        }}
      />

      {/* Results info */}
      <p>
        Showing {items.length} items (offset: {offset}){debouncedSearchQuery && ` for "${debouncedSearchQuery}"`}
        {loading && ' (Loading...)'}
      </p>

      {/* Items list */}
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <Link to={'/items/' + item.id}>{item.name}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No items found</p>
      )}

      {/* Simple navigation */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
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
    </div>
  );
}

export default Items;
