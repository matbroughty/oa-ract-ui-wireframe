
# Purity Dashboard Starter (Chakra + Vite + TS)

A minimal React dashboard starter using Chakra UI with a Purity-style aesthetic. 
Includes a Companies table (sortable + search) rendering rows from `components/Tables/TablesTableRow`.

## Quickstart

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Structure

- `src/pages/CompaniesTable.tsx` — table page with sorting + local/global search
- `src/components/Tables/TablesTableRow.tsx` — row component (status pill + actions)
- `src/components/Cards/StatCard.tsx` — KPI stat card component
- `src/components/Activity/ActivityItem.tsx` — recent activity list item
- `src/data/companies.ts` — 20 dummy companies
- `src/data/metrics.ts` — dashboard KPIs (dummy)
- `src/data/activities.ts` — recent activity feed (dummy)
- `src/theme/theme.ts` — Purity-like theme (colors, fonts)

## Notes

- This project does **not** include proprietary Purity template files; it's a clean-room Chakra setup styled similarly.
- Replace the dummy data with your API calls later.
