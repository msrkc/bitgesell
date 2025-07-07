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

   - Implement paginated list with server‑side search (`q` param). Contribute to both client and server.

3. **Performance**

   - The list can grow large. Integrate **virtualization** (e.g., `react-window`) to keep UI smooth.

4. **UI/UX Polish**
   - Feel free to enhance styling, accessibility, and add loading/skeleton states.

### 📦 What We Expect

- Idiomatic, clean code with comments where necessary.
- Solid error handling and edge‑case consideration.
- Tests that pass via `npm test` in both frontend and backend.
- A brief `SOLUTION.md` describing **your approach and trade‑offs**.

## Quick Start

node version: 18.XX

```bash
nvm install 18
nvm use 18

# Terminal 1
cd backend
npm install
npm start

# Terminal 2
cd frontend
npm install
npm start
```

> The frontend proxies `/api` requests to `http://localhost:3001`.
