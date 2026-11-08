# Global Health Explorer

## Build

- Replace the starter screen with a polished, responsive educational health-information experience guided by the uploaded brief.
- Establish a calm, health-oriented semantic design system and reusable public navigation, footer, topic summaries, country exploration, data explanations, and charts.
- Create flexible, clearly illustrative sample data for the nine requested health categories and twelve countries. Show sources, periods, and units where available; represent unavailable data explicitly rather than as zero.
- Implement the public home, topic pages, searchable country explorer and profiles, country comparison, and About page with meaningful local interactions.
- Add a distinct administrator area with prototype-only sign-in, an overview, editable country/topic/indicator/record/source collections, and CSV preview, validation, and simulated import.
- Keep data and UI organized so sample access can later be replaced by REST calls; do not add a backend or claim that prototype sign-in secures real data.

## Verification

- Add focused tests for the stated country/category catalogue and sample-data labeling rules.
- Verify key public navigation/search and the mock admin login/edit/import interactions in the running preview, then review build and runtime diagnostics.
- Give every content route its own title, description, Open Graph title/description/type, and Twitter card metadata.

## Technical details

- Use the existing TanStack Start file-based routes and React/Tailwind v4 setup; leave generated route files untouched.
- Use existing UI primitives and Recharts where a visualization helps explain a trend or comparison.
- Keep prototype data in browser-safe frontend modules and interactions local; do not enable Lovable Cloud.

The plan looks good. Before proceeding, please make sure of the following additional requirements:

1. **Interactive visualizations:** Charts must be genuinely interactive, not just static visualizations. Users should be able to select indicators, choose one or multiple countries, select years or year ranges, and see the graph update immediately when filters change. Country comparisons should also update dynamically. Allow chart-type switching where appropriate (line, bar, pie/donut, etc.).
2. **Indicators per topic:** Each of the eight actual health topics (excluding Global Health, which is an overview) should support approximately 5–6 relevant health indicators. These should be individually selectable in the interactive exploration sections. Avoid redundant indicators, and don't invent data for indicators where reliable sample values are unavailable.
3. **Educational content:** Each topic page should contain a simple-English introduction, an explanation of what the topic means, why it matters, its impact on people's lives, and explanations of the indicators and visualizations. The website should teach users how to understand the information, not just display numbers and charts.
4. **Data transparency:** Display the data source, measurement unit, and reference year alongside statistics and charts wherever available. Clearly explain missing data and avoid treating missing values as zero.
5. **Visualization variety:** Use different chart types according to the information being presented. Use line charts for historical trends, bar charts for country comparisons, pie/donut charts for proportions, and maps or other visualizations where they genuinely improve understanding. Avoid adding charts merely for decoration.

Please retain the existing technical approach and frontend-only scope. Do not add a backend, database, or unnecessary features at this stage.