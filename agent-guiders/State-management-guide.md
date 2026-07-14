# State Management Guidelines

## 1. The State Hierarchy Rule
Always place state as close to where it's needed as possible. Do not put everything in global state.
Follow this hierarchy:
1. **URL State**: For pagination, filters, active tabs, and sort orders. (Shareable and persistent).
2. **Local Component State**: For purely visual toggles (e.g., `isOpen` for a dropdown).
3. **Context / Scoped State**: For state shared across a specific feature tree (e.g., a Multi-step Form).
4. **Server State**: For cached API responses (e.g., React Query, SWR, Apollo).
5. **Global Client State**: For app-wide settings (Theme, Auth User, Shopping Cart). (e.g., Redux, Zustand).

## 2. Avoid Derived State
- If state can be calculated from existing props or state, compute it on the fly instead of storing it into another `useState`.
- **Bad**: Storing `filteredList` in state alongside `list` and `searchQuery`.
- **Good**: Computing `filteredList` during the render based on `list` and `searchQuery`.

## 3. Server State vs Client State
- Distinguish between data that comes from the backend (Server State) and data the user manages on the frontend (Client State).
- Use proper caching and revalidation strategies for server state instead of manual Redux actions.
