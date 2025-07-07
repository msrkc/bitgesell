## Objectives

### 🔧 Backend (Node.js)

1. **Refactor blocking I/O**

- Replaced synchronous fs.readFileSync and fs.writeFileSync with async/await (fs.promises)
- Updated all route handlers to use asynchronous functions for improved performance
- Added basic validatiob
- Ensured API remains responsive under load by preventing event loop blocking

2. **Performance**

- Implemented in-memory cache with 5-minute TTL for computed statistics
- Stats are recalculated only when cache expires, reducing CPU usage and file I/O

3. **Testing**

- Implemented comprehensive Jest tests for /api/items and /api/stats endpoints
- Used manual and automatic mocking of fs.promises to isolate file system operations
- Ensured cache reset and module isolation between tests to prevent state leakage
- Added tests for GET, POST, query, and error scenarios for both endpoints

### 💻 Frontend (React)

1. **Memory Leak**

- Used exising active flag in useEffect cleanup to ensure state updates only occur if component is still mounted
- Prevents memory leaks and React warnings when fetchItems resolves after component unmount
- Note: For production, using React Query or AbortController is recommended for robust fetch cancellation and resource management

2. **Pagination & Search**

- Added offset/limit-based pagination to backend API with configurable page sizes
- Implemented server-side search functionality using query parameter filtering
- Enhanced frontend with debounced search input (300ms delay) to reduce API calls
- Added pagination controls with Previous/Next navigation and loading states
- Updated DataContext to support fetchWithOffset for efficient data fetching
- Improved user experience with real-time search results and responsive pagination

3. **Performance**

- Added @tanstack/react-virtual for efficient rendering of large item lists
- Implemented mock data generator utility to create 1000+ test items for performance testing
- Enhanced DataContext with generateMockData function for testing large datasets
- Maintained pagination controls for API data while supporting bulk loading for mock data

4. **UI/UX Polish**
