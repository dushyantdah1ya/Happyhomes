import assert from 'node:assert';
import { getRouteMetadata } from '../src/utils/routeMetadata.js';
import { NAVIGATION_REGISTRY } from '../src/config/navigation.js';
import { render } from '../src/entry.server.js';
import { FAQS_DATA } from '../src/data/faqsData.js';

async function runS14Tests() {
  console.log('=== S14 Buying Process, Remote Buyers & FAQs Test Suite ===\n');

  // TEST 1: Navigation Registry Integration
  console.log('1. Checking Navigation Registry Disclosures:');
  const buyerGuide = (NAVIGATION_REGISTRY as any).buyerGuide;
  assert.ok(buyerGuide, 'NAVIGATION_REGISTRY.buyerGuide must exist');
  assert.strictEqual(buyerGuide.label, 'Buyer Guide');
  assert.strictEqual(buyerGuide.items.length, 4, 'Must have 4 items in buyerGuide dropdown');

  assert.strictEqual(buyerGuide.items[0].label, 'Buying Process');
  assert.strictEqual(buyerGuide.items[0].href, '/buying-process');

  assert.strictEqual(buyerGuide.items[1].label, 'Remote & NRI Buyers');
  assert.strictEqual(buyerGuide.items[1].href, '/nri-buyers');

  assert.strictEqual(buyerGuide.items[2].label, 'Frequently Asked Questions');
  assert.strictEqual(buyerGuide.items[2].href, '/faqs');

  assert.strictEqual(buyerGuide.items[3].label, 'Contact the Builder');
  assert.strictEqual(buyerGuide.items[3].href, '/contact');

  assert.strictEqual(NAVIGATION_REGISTRY.visitChecklist.label, 'Visit Checklist');
  assert.strictEqual(NAVIGATION_REGISTRY.visitChecklist.href, '/visit-checklist');

  assert.strictEqual(NAVIGATION_REGISTRY.primaryCta.label, 'Plan a Visit');
  assert.strictEqual(NAVIGATION_REGISTRY.primaryCta.href, '/contact?intent=visit#enquiry');
  console.log('  ✓ NAVIGATION_REGISTRY contains 4 Buyer Guide dropdown destinations, top-level Visit Checklist, and Plan a Visit CTA');

  // TEST 2: Route Metadata & Canonical Rules
  console.log('\n2. Checking Route Metadata for All 3 New Destinations:');
  
  const buyingMeta = getRouteMetadata('/buying-process');
  assert.strictEqual(buyingMeta.statusCode, 200);
  assert.ok(buyingMeta.title.includes('Buying a Home with Happy Homes'));
  assert.strictEqual(buyingMeta.robots, 'noindex, nofollow');
  assert.strictEqual(getRouteMetadata('/buying-process/').statusCode, 200);
  console.log('  ✓ /buying-process metadata returns 200, correct title, and robots policy');

  const nriMeta = getRouteMetadata('/nri-buyers');
  assert.strictEqual(nriMeta.statusCode, 200);
  assert.ok(nriMeta.title.includes('Remote & NRI Buyers'));
  assert.strictEqual(nriMeta.robots, 'noindex, nofollow');
  assert.strictEqual(getRouteMetadata('/nri-buyers/').statusCode, 200);
  console.log('  ✓ /nri-buyers metadata returns 200, correct title, and robots policy');

  const faqMeta = getRouteMetadata('/faqs');
  assert.strictEqual(faqMeta.statusCode, 200);
  assert.ok(faqMeta.title.includes('Frequently Asked Questions'));
  assert.strictEqual(faqMeta.robots, 'noindex, nofollow');
  assert.strictEqual(getRouteMetadata('/faqs/').statusCode, 200);
  console.log('  ✓ /faqs metadata returns 200, correct title, and robots policy');

  // 404 test for unknown route
  const notFoundMeta = getRouteMetadata('/non-existent-route-xyz');
  assert.strictEqual(notFoundMeta.statusCode, 404);
  console.log('  ✓ Unknown routes return status code 404');

  // TEST 3: FAQ Collection Verification
  console.log('\n3. Checking Typed FAQ Dataset:');
  assert.ok(Array.isArray(FAQS_DATA), 'FAQS_DATA must be an array');
  assert.strictEqual(FAQS_DATA.length, 12, 'Must contain 12 typed questions');
  
  const expectedIds = [
    'property-types',
    'currently-listed',
    'empty-inventory',
    'inquire-particular',
    'request-site-visit',
    'visit-confirmation',
    'video-viewing',
    'time-zone',
    'plans-brochure',
    'price-on-request',
    'confirm-terms',
    'document-review',
  ];
  for (const id of expectedIds) {
    const item = FAQS_DATA.find((f) => f.id === id);
    assert.ok(item, `FAQ item ${id} must exist`);
    assert.ok(item.question.length > 0);
    assert.ok(item.answer.length > 0);
  }
  console.log('  ✓ All 12 required FAQ items are present with stable IDs and plain-language answers');

  // TEST 4: SSR Content Rendering — Buying Process Page
  console.log('\n4. Checking Server-Side Rendering: /buying-process');
  const buyingRender = render('/buying-process', { developments: [] });
  assert.strictEqual(buyingRender.statusCode, 200);
  assert.ok(
    buyingRender.html.includes('Buying a home with') && buyingRender.html.includes('Happy Homes'),
    'Page must contain heading "Buying a home with Happy Homes"'
  );
  assert.ok(
    buyingRender.html.includes('STAGE 01') && buyingRender.html.includes('STAGE 06'),
    'Page must render all 6 stages'
  );
  assert.ok(
    buyingRender.html.includes('Planning Guide Notice — Not a Contractual Commitment') ||
    buyingRender.html.includes('Planning Guide Notice'),
    'Page must clarify this is a planning guide, not a contractual commitment'
  );
  assert.ok(
    buyingRender.html.includes('not an automatically confirmed appointment') ||
    buyingRender.html.includes('An enquiry receipt is not a confirmed booking'),
    'Page must state requested appointments require confirmation'
  );
  assert.ok(
    buyingRender.html.includes('/contact?intent=visit#enquiry'),
    'Page must link to visit intent'
  );
  assert.ok(
    buyingRender.html.includes('/contact?intent=video#enquiry'),
    'Page must link to video intent'
  );
  assert.ok(
    buyingRender.html.includes('/developments'),
    'Page must link to developments catalogue'
  );
  console.log('  ✓ SSR renders /buying-process with stages, disclaimer, unconfirmed-visit wording, and valid intent links');

  // TEST 5: SSR Content Rendering — Remote & NRI Buyers Page
  console.log('\n5. Checking Server-Side Rendering: /nri-buyers');
  const nriRender = render('/nri-buyers', { developments: [] });
  assert.strictEqual(nriRender.statusCode, 200);
  assert.ok(
    nriRender.html.includes('Planning your purchase from') && nriRender.html.includes('outside Jaipur'),
    'Page must contain heading "Planning your purchase from outside Jaipur"'
  );
  assert.ok(
    nriRender.html.includes('Request a video viewing'),
    'Page must feature primary action "Request a video viewing"'
  );
  assert.ok(
    nriRender.html.includes('/contact?intent=video#enquiry'),
    'Page must link to /contact?intent=video#enquiry'
  );
  assert.ok(
    nriRender.html.includes('/contact#enquiry'),
    'Page must link to secondary action /contact#enquiry'
  );
  assert.ok(
    nriRender.html.includes('Indian Standard Time') || nriRender.html.includes('IST'),
    'Page must clarify that preferred time windows operate in IST'
  );
  assert.ok(
    nriRender.html.includes('Independent Legal, Banking &amp; Tax Diligence Notice') ||
    nriRender.html.includes('Independent Legal, Banking & Tax Diligence Notice') ||
    nriRender.html.includes('Tax Diligence Notice'),
    'Page must contain independent legal/tax notice'
  );
  // Boundary check: No prohibited promises
  assert.ok(!nriRender.html.includes('guaranteed mortgage'), 'Must not promise guaranteed mortgage');
  assert.ok(!nriRender.html.includes('airport pickup'), 'Must not promise airport pickup');
  console.log('  ✓ SSR renders /nri-buyers with primary video action, IST notice, and strict boundaries');

  // TEST 6: SSR Content Rendering — FAQs Page
  console.log('\n6. Checking Server-Side Rendering: /faqs');
  const faqRender = render('/faqs', { developments: [] });
  assert.strictEqual(faqRender.statusCode, 200);
  assert.ok(
    faqRender.html.includes('Frequently asked') && faqRender.html.includes('questions'),
    'Page must contain heading "Frequently asked questions"'
  );
  // Verify all 12 questions appear in server-rendered HTML
  for (const item of FAQS_DATA) {
    assert.ok(
      faqRender.html.includes(item.question),
      `SSR HTML must include question: "${item.question}"`
    );
  }
  assert.ok(
    faqRender.html.includes('aria-expanded') && faqRender.html.includes('aria-controls'),
    'Accessible disclosure markup must be present'
  );
  assert.ok(
    faqRender.html.includes('not an automatically confirmed appointment') ||
    faqRender.html.includes('An enquiry receipt is not a confirmed booking'),
    'Unconfirmed visit wording must be present in FAQ answer'
  );
  console.log('  ✓ SSR renders /faqs with all 12 questions, accessible disclosure attributes, and server-rendered HTML');

  // TEST 7: Preservation of Home and Existing Features
  console.log('\n7. Checking Preservation of Home & Locality Hub:');
  const homeRender = render('/', { developments: [] });
  assert.ok(
    homeRender.html.includes('Jaipur,<br class="hidden sm:inline" />Undisputed.') ||
    homeRender.html.includes('Jaipur,') && homeRender.html.includes('Undisputed.'),
    'Home hero heading intact'
  );
  assert.ok(
    homeRender.html.includes('Explore Our Developments'),
    'Home hero CTA button intact'
  );

  const locHubRender = render('/jaipur-localities', { developments: [] });
  assert.strictEqual(locHubRender.statusCode, 200);
  assert.ok(locHubRender.html.includes('Jaipur residential'), 'Locality hub intact');

  const jagatpuraRender = render('/jaipur-localities/jagatpura', { developments: [] });
  assert.strictEqual(jagatpuraRender.statusCode, 200);
  assert.ok(jagatpuraRender.html.includes('Jagatpura, Jaipur'), 'Jagatpura guide intact');

  const kusumMeta = getRouteMetadata('/jaipur-localities/kusum-vihar');
  assert.strictEqual(kusumMeta.statusCode, 302, 'Kusum Vihar remains withheld and redirects');
  console.log('  ✓ Home hero, Locality Hub, Jagatpura, and Kusum Vihar redirect are intact');

  console.log('\n=== All S14 Tests Passed Successfully ===');
}

runS14Tests().catch((err) => {
  console.error('\n❌ Test Failure:', err);
  process.exit(1);
});
