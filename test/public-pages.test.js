const { existsSync, readFileSync } = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const read = (path) => readFileSync(path, 'utf8');

const requiredPages = [
  'src/app/page.tsx',
  'src/app/about/page.tsx',
  'src/app/contact/page.tsx',
  'src/app/shop/page.tsx',
  'src/app/courses/[slug]/page.tsx',
  'src/app/products/[slug]/page.tsx',
  'src/app/certificate/verify/[code]/page.tsx',
  'src/app/invoice/verify/[code]/page.tsx',
  'src/app/privacy-policy/page.tsx',
  'src/app/terms-and-conditions/page.tsx',
  'src/app/refund-policy/page.tsx',
  'src/app/cookie-policy/page.tsx',
  'src/app/copyright-policy/page.tsx'
];

test('provides all requested public pages', () => {
  for (const path of requiredPages) {
    assert.ok(existsSync(path), `${path} should exist`);
  }
});

test('homepage renders dynamic public LMS sections', () => {
  const homepage = read('src/app/page.tsx');

  assert.match(homepage, /getFeaturedCourse/);
  assert.match(homepage, /getPublishedCourses/);
  assert.match(homepage, /Featured course/);
  assert.match(homepage, /Student feedback/);
  assert.match(homepage, /Contact us/);
  assert.match(homepage, /PublicFooter/);
});

test('course and product pages include dynamic metadata and schema', () => {
  const coursePage = read('src/app/courses/[slug]/page.tsx');
  const productPage = read('src/app/products/[slug]/page.tsx');

  assert.match(coursePage, /generateMetadata/);
  assert.match(coursePage, /courseSchema/);
  assert.match(coursePage, /getCountdownLabel/);
  assert.match(coursePage, /Curriculum preview/);
  assert.match(coursePage, /faqs/);

  assert.match(productPage, /generateMetadata/);
  assert.match(productPage, /productSchema/);
  assert.match(productPage, /accessType|access_type/);
  assert.match(productPage, /category/);
});

test('seo routes include sitemap, robots, canonical URLs, and Open Graph metadata', () => {
  assert.ok(existsSync('src/app/sitemap.ts'));
  assert.ok(existsSync('src/app/robots.ts'));

  const seo = read('src/lib/seo.ts');
  const sitemap = read('src/app/sitemap.ts');
  const robots = read('src/app/robots.ts');

  assert.match(seo, /alternates/);
  assert.match(seo, /canonical/);
  assert.match(seo, /openGraph/);
  assert.match(seo, /courseSchema/);
  assert.match(seo, /productSchema/);
  assert.match(sitemap, /getPublishedCourses/);
  assert.match(sitemap, /getPublishedProducts/);
  assert.match(robots, /sitemap/);
});

test('contact form uses a secure server action and Zod validation', () => {
  const contactPage = read('src/app/contact/page.tsx');
  const actions = read('src/actions/index.ts');
  const validations = read('src/lib/validations.ts');

  assert.match(contactPage, /submitContactMessageAction/);
  assert.match(actions, /contactMessageSchema/);
  assert.match(actions, /createAdminClient/);
  assert.match(actions, /contact_messages/);
  assert.match(validations, /contactMessageSchema/);
  assert.match(validations, /message/);
});

test('certificate and invoice verification use server-side lookup helpers', () => {
  const publicData = read('src/lib/public-data.ts');
  const certificatePage = read('src/app/certificate/verify/[code]/page.tsx');
  const invoicePage = read('src/app/invoice/verify/[code]/page.tsx');

  assert.match(publicData, /createAdminClient/);
  assert.match(publicData, /verifyCertificate/);
  assert.match(publicData, /verifyInvoice/);
  assert.match(certificatePage, /verifyCertificate/);
  assert.match(invoicePage, /verifyInvoice/);
});
