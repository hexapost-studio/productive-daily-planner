import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import { execSync } from 'child_process'
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

const PAGES = ['/', '/planner', '/projects', '/settings', '/stats', '/inbox', '/goals']
const PORT = 3999

async function main() {
  const app = next({ dev: false, dir: process.cwd() })
  await app.prepare()
  const handle = app.getRequestHandler()
  const server = createServer((req, res) => handle(req, res, parse(req.url ?? '/', true)))
  await new Promise<void>((r) => server.listen(PORT, r))

  const browser = await chromium.launch()
  let failures = 0

  for (const path of PAGES) {
    const page = await browser.newPage()
    await page.goto(`http://localhost:${PORT}${path}`)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    if (results.violations.length > 0) {
      console.error(`\n❌ ${path} — ${results.violations.length} violation(s)`)
      for (const v of results.violations) {
        console.error(`  [${v.impact}] ${v.id}: ${v.description}`)
        for (const node of v.nodes.slice(0, 2)) {
          console.error(`    → ${node.html.slice(0, 100)}`)
        }
      }
      failures++
    } else {
      console.log(`✅ ${path} — aucune violation WCAG 2.1 AA`)
    }
    await page.close()
  }

  await browser.close()
  server.close()

  if (failures > 0) {
    console.error(`\n${failures} page(s) avec des violations d'accessibilité.`)
    process.exit(1)
  } else {
    console.log('\n✅ Toutes les pages passent l\'audit axe-core WCAG 2.1 AA')
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
