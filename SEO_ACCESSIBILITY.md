# SEO, Accessibility and Performance Requirements

## SEO
- Render public marketing and educational overview pages in crawlable HTML (SSR/SSG as appropriate).
- Unique title and meta description per indexable page.
- Canonical URLs.
- XML sitemap generated from approved public routes/content.
- Correct robots.txt; never accidentally index private dashboards, classrooms, profiles or admin pages.
- Semantic heading hierarchy and descriptive links.
- Open Graph and social preview metadata.
- Structured data only when content qualifies; do not invent ratings/reviews.
- Clean readable slugs and redirects for changed URLs.
- Internal linking between related public lessons/topics.
- Avoid duplicate thin pages and query-parameter indexing traps.
- Add hreflang only if real localized versions exist.
- Include useful public FAQ and educational topic pages where appropriate.
- Provide noindex rules for authenticated/private pages.
- Verify sitemap, canonical, robots and metadata in automated checks.

## Accessibility
Target WCAG 2.2 AA where practical:
- Semantic HTML and landmarks.
- Full keyboard navigation.
- Visible focus indicators.
- Accessible labels and instructions.
- Correct contrast.
- Screen-reader announcements for dynamic quiz/game feedback.
- Do not use color alone to communicate.
- Dialog focus management and escape behavior.
- Accessible chart summaries or data alternatives.
- Captions/transcripts for media.
- Reduced-motion support.
- Touch target sizes suitable for mobile.
- Accessible error summaries and inline validation.

## Performance
- Set performance budgets and measure Core Web Vitals.
- Optimize images and responsive sources.
- Lazy-load below-the-fold media.
- Avoid shipping unnecessary JavaScript to public pages.
- Code-split large app modules.
- Cache public content safely.
- Paginate large lists.
- Avoid blocking third-party scripts.
- Monitor LCP, INP and CLS in production when approved.
- Test on mid-range mobile devices and slower networks.
