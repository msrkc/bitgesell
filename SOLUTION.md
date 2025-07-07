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
   - Add **unit tests** (Jest) for items routes (happy path + error cases).

### 💻 Frontend (React)

1. **Memory Leak**

   - `Items.js` leaks memory if the component unmounts before fetch completes. Fix it.

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
