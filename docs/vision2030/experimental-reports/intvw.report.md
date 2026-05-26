# Experimental Project Report: intvw

> **Status:** Analyzed as part of the Vision 2030 Global Audit
> **Path:** `/Users/sac/intvw`

## 1. Audit Status
- **Test Status:** ❌ Failing / Broken Build

## 2. Executable Entry Points
- `intvw/package.json`

## 3. Extracted Documentation & Context
### Source: `intvw/README.md`
```markdown
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

...
```

### Source: `intvw/SEANCN-PRD.md`
```markdown
Perfect, let’s canonize it as **`seancn`**: your own shadcn-style kit that uses a **Tailwind-clone utility layer** (same class names, no Tailwind installed).

I’ll give you:

1. `seancn.css` – your Tailwind-style utilities.
2. Core `seancn` components wired to those utilities: `Button`, `Input`, `Label`, `Card`, `Table`, `Toolbar`.
3. A quick example of usage.

You can drop this straight into a React project and say:

> “I built a small seancn UI library for my interview work.”

---

## 1. `seancn.css` – Tailwind-clone utilities

Create `src/seancn.css` and import it once in `main.jsx` or `index.jsx`:

```css
/* layout */
.flex        { display: flex; }
.inline-flex { display: inline-flex; }
.flex-col    { flex-direction: column; }
.items-center{ align-items: center; }
.items-start { align-items: flex-start; }
.items-end   { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between{ justify-content: space-between; }
.justify-start  { justify-content: flex-start; }
.justify-end    { justify-content: flex-end; }
.flex-wrap      { flex-wrap: wrap; }

/* spacing */
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }

.p-2  { padding: 0.5rem; }
.p-3  { padding: 0.75rem; }
...
```

### Source: `intvw/docs/README.md`
```markdown
# seancn Interview Prep Documentation

This folder contains comprehensive guides for using seancn in technical interviews.

## Contents

### Usage Guides
- **[Component Guide](./usage/component-guide.md)** - Complete reference for all seancn components
- **[Hooks Guide](./usage/hooks-guide.md)** - How to use seancn React hooks
- **[Patterns Guide](./usage/patterns-guide.md)** - Common UI patterns and implementations
- **[Quick Start](./usage/quick-start.md)** - Get up and running in 5 minutes

### Interview Rubrics
- **[Frontend Interview Rubric](./rubrics/frontend-rubric.md)** - What interviewers evaluate
- **[Component Design Rubric](./rubrics/component-design-rubric.md)** - Building reusable components
- **[Code Quality Rubric](./rubrics/code-quality-rubric.md)** - Clean code standards

### Business Cases
- **[E-commerce Dashboard](./cases/ecommerce-dashboard.md)** - Product management interface
- **[Data Table with Filters](./cases/data-table-filters.md)** - Complex filtering and sorting
- **[Form Builder](./cases/form-builder.md)** - Dynamic form creation
- **[Real-time Search](./cases/realtime-search.md)** - Search with debouncing and API calls
- **[Admin Panel](./cases/admin-panel.md)** - Multi-section admin interface

### Interview Tips
- **[Interview Strategy](./tips/interview-strategy.md)** - How to approach interviews
- **[Common Pitfalls](./tips/common-pitfalls.md)** - Mistakes to avoid
- **[Time Management](./tips/time-management.md)** - Managing interview time effectively


...
```

*(Plus 16 other markdown files)*
