import assert from 'node:assert';
import { getRouteMetadata } from '../src/utils/routeMetadata.js';
import { NAVIGATION_REGISTRY } from '../src/config/navigation.js';
import { render } from '../src/entry.server.js';
import { ENABLED_STATIC_PUBLIC_ROUTES, generateSitemapXml } from '../src/server/sitemapService.js';

async function runTests() {
  console.log('=== Our Approach & Visit Checklist Test Suite ===\n');

  // TEST 1: Navigation Registry Integration
  console.log('1. Checking Navigation Registry Disclosures:');
  
  // Verify aboutUs has 2 dropdown items and buyerGuide has 4 dropdown items
  assert.strictEqual(NAVIGATION_REGISTRY.aboutUs.items.length, 2, 'aboutUs dropdown has 2 destinations');
  assert.strictEqual(NAVIGATION_REGISTRY.buyerGuide.items.length, 4, 'buyerGuide dropdown has 4 destinations');
  
  // Verify top-level direct navigation entries exist
  assert.ok(NAVIGATION_REGISTRY.ourApproach, 'NAVIGATION_REGISTRY must contain ourApproach direct item');
  assert.strictEqual(NAVIGATION_REGISTRY.ourApproach.href, '/our-approach');
  assert.strictEqual(NAVIGATION_REGISTRY.ourApproach.label, 'Our Approach');

  assert.ok(NAVIGATION_REGISTRY.visitChecklist, 'NAVIGATION_REGISTRY must contain visitChecklist direct item');
  assert.strictEqual(NAVIGATION_REGISTRY.visitChecklist.href, '/visit-checklist');
  assert.strictEqual(NAVIGATION_REGISTRY.visitChecklist.label, 'Visit Checklist');

  // Verify direct items are removed from dropdown arrays to prevent duplication
  assert.strictEqual(NAVIGATION_REGISTRY.aboutUs.items.find((i: any) => i.href === '/our-approach'), undefined);
  assert.strictEqual(NAVIGATION_REGISTRY.buyerGuide.items.find((i: any) => i.href === '/visit-checklist'), undefined);

  // Verify redundant planningGuide workaround is removed
  assert.strictEqual((NAVIGATION_REGISTRY as any).planningGuide, undefined, 'planningGuide workaround removed');
  console.log('  ✓ NAVIGATION_REGISTRY correctly exposes 6 first-level destinations with direct links for Our Approach and Visit Checklist');

  // TEST 2: Route Metadata
  console.log('\n2. Checking Route Metadata:');
  const testOrigin = 'https://preview.example.com';

  const approachMeta = getRouteMetadata('/our-approach', { explicitOrigin: testOrigin });
  assert.strictEqual(approachMeta.statusCode, 200);
  assert.ok(approachMeta.title.includes('Our Approach'));
  assert.strictEqual(approachMeta.robots, 'noindex, nofollow');
  assert.strictEqual(approachMeta.canonicalPath, '/our-approach');
  assert.ok(approachMeta.jsonLd, 'Must have structured data');
  assert.strictEqual(getRouteMetadata('/our-approach/').statusCode, 200, 'Trailing slash resolves to 200');
  console.log('  ✓ /our-approach route metadata returns 200, title, canonical, and noindex policy');

  const checklistMeta = getRouteMetadata('/visit-checklist', { explicitOrigin: testOrigin });
  assert.strictEqual(checklistMeta.statusCode, 200);
  assert.ok(checklistMeta.title.includes('Homebuyer Visit Checklist'));
  assert.strictEqual(checklistMeta.robots, 'noindex, nofollow');
  assert.strictEqual(checklistMeta.canonicalPath, '/visit-checklist');
  assert.ok(checklistMeta.jsonLd, 'Must have structured data');
  assert.strictEqual(getRouteMetadata('/visit-checklist/').statusCode, 200, 'Trailing slash resolves to 200');
  console.log('  ✓ /visit-checklist route metadata returns 200, title, canonical, and noindex policy');

  // TEST 3: SSR Markup Rendering — Our Approach
  console.log('\n3. Checking Server-Side Rendering: /our-approach');
  const approachRender = render('/our-approach', { explicitOrigin: testOrigin });
  assert.strictEqual(approachRender.statusCode, 200);
  assert.ok(
    approachRender.html.includes('A clearer way to explore') && approachRender.html.includes('your next home'),
    'Page must contain heading "A clearer way to explore your next home."'
  );
  assert.ok(
    approachRender.html.includes('Start with your requirements'),
    'Section 1: Start with your requirements must be present'
  );
  assert.ok(
    approachRender.html.includes('Look at the particular property'),
    'Section 2: Look at the particular property must be present'
  );
  assert.ok(
    approachRender.html.includes('Ask direct questions'),
    'Section 3: Ask direct questions must be present'
  );
  assert.ok(
    approachRender.html.includes('Make an informed decision'),
    'Section 4: Make an informed decision must be present'
  );
  assert.ok(
    approachRender.html.includes('/developments'),
    'Must link to /developments catalogue'
  );
  assert.ok(
    approachRender.html.includes('/contact#enquiry'),
    'Must link to /contact#enquiry'
  );
  assert.ok(
    approachRender.html.includes('/construction-quality'),
    'Must link contextually to /construction-quality'
  );
  assert.ok(
    approachRender.html.includes('/buying-process'),
    'Must link contextually to /buying-process'
  );
  assert.ok(
    approachRender.html.includes('Ask for the proposed terms in writing and arrange appropriate independent review before making a commitment'),
    'Must include exact replacement phrase for written terms and review'
  );
  assert.ok(
    !approachRender.html.includes('all commitments are governed strictly by executed written agreements'),
    'Must not include obsolete legal assertion'
  );
  assert.ok(
    !approachRender.html.includes('speculative design consultancy'),
    'Must not include invented negative exclusions'
  );
  console.log('  ✓ /our-approach SSR renders all 4 sections, links, and correct constraints');

  // TEST 4: SSR Markup Rendering — Visit Checklist
  console.log('\n4. Checking Server-Side Rendering: /visit-checklist');
  const checklistRender = render('/visit-checklist', { explicitOrigin: testOrigin });
  assert.strictEqual(checklistRender.statusCode, 200);
  assert.ok(
    checklistRender.html.includes('Make the most of') && checklistRender.html.includes('your property visit'),
    'Page must contain heading "Make the most of your property visit."'
  );
  assert.ok(
    checklistRender.html.includes('Advisory Note — General Practical Guide, Not Professional Advice') ||
    checklistRender.html.includes('not constitute technical, engineering, structural, valuation, architectural, or legal advice'),
    'Prominent advisory note disclaimer must be present'
  );
  assert.ok(
    checklistRender.html.includes('Before the Visit'),
    'Section 1: Before the Visit must be present'
  );
  assert.ok(
    checklistRender.html.includes('During the Visit'),
    'Section 2: During the Visit must be present'
  );
  assert.ok(
    checklistRender.html.includes('After the Visit'),
    'Section 3: After the Visit must be present'
  );
  assert.ok(
    checklistRender.html.includes('/contact?intent=visit#enquiry'),
    'Must provide quick link to /contact?intent=visit#enquiry'
  );
  assert.ok(
    checklistRender.html.includes('Request a Site Visit'),
    'Must use "Request a Site Visit" rather than "Schedule a Viewing"'
  );
  assert.ok(
    checklistRender.html.includes('/contact?intent=video#enquiry'),
    'Must provide video-viewing link to /contact?intent=video#enquiry'
  );
  assert.ok(
    checklistRender.html.includes('Request a Video Viewing'),
    'Must use "Request a Video Viewing" action label'
  );
  assert.ok(
    checklistRender.html.includes('team confirmation'),
    'Must state that requests require team confirmation'
  );
  assert.ok(
    checklistRender.html.includes('/construction-quality'),
    'Must link contextually to /construction-quality'
  );
  assert.ok(
    checklistRender.html.includes('/buying-process'),
    'Must link contextually to /buying-process'
  );
  assert.ok(
    checklistRender.html.includes('/our-approach'),
    'Must link contextually to /our-approach'
  );
  console.log('  ✓ /visit-checklist SSR renders advisory notice, 3 sections, video note, and required quick links');

  // TEST 5: Sitemap Integration
  console.log('\n5. Checking Sitemap Integration:');
  assert.ok((ENABLED_STATIC_PUBLIC_ROUTES as readonly string[]).includes('/our-approach'));
  assert.ok((ENABLED_STATIC_PUBLIC_ROUTES as readonly string[]).includes('/visit-checklist'));

  const sitemapXml = generateSitemapXml({ origin: testOrigin, publicDevelopments: [] });
  assert.ok(sitemapXml.includes('<loc>https://preview.example.com/our-approach</loc>'));
  assert.ok(sitemapXml.includes('<loc>https://preview.example.com/visit-checklist</loc>'));
  console.log('  ✓ /our-approach and /visit-checklist included in sitemap generator');

  console.log('\n=== All Tests Passed Successfully ===');
}

runTests().catch((err) => {
  console.error('\n❌ Test Failure:', err);
  process.exit(1);
});
