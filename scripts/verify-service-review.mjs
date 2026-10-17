import fs from 'node:fs/promises';
import { load } from 'cheerio';
const expected = [
  'social-posts',
  'community-engagement',
  'meta-ads',
  'google-ads',
  'seo-content',
  'newsletters',
  'website-support',
  'landing-page',
  'homepage',
  'website-page',
  'google-business-profile',
];
const failures = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
};
for (const slug of expected) {
  const text = await fs.readFile(
    new URL(`../dist/services/${slug}/index.html`, import.meta.url),
    'utf8',
  );
  const $ = load(text),
    main = $('main').text().replace(/\s+/g, ' '),
    form = $('[data-demo-inquiry]');
  check(form.length === 1, `${slug}: missing demo form`);
  check(form.find('option[selected]').val() === slug, `${slug}: wrong preselected service`);
  check(form.find('[data-demo-fields][disabled]').length === 1, `${slug}: unsafe no-JS controls`);
  check(!form.attr('action') && !form.attr('data-netlify'), `${slug}: live endpoint on demo`);
  check(form.find('option').length === 12, `${slug}: unexpected service catalog`);
  check(
    main.includes('$400') &&
      main.includes('Costs outside the $400 fee') &&
      main.includes('Scope to confirm'),
    `${slug}: missing price or scope disclosure`,
  );
  check(
    main.includes('Nothing is sent, saved, charged or booked'),
    `${slug}: unclear demonstration status`,
  );
  check(
    !/(?:tel:|sms:|318.{0,4}376.{0,4}6914|googletagmanager\.com|google-analytics\.com)/i.test(text),
    `${slug}: personal phone or tracker leaked`,
  );
  check(
    $('meta[name="robots"]').attr('content') === 'noindex, nofollow',
    `${slug}: preview is indexable`,
  );
  for (const input of form.find('input:not([type="checkbox"]),select,textarea').toArray())
    check($(`label[for="${$(input).attr('id')}"]`).length === 1, `${slug}: unlabeled control`);
}
const $ = load(await fs.readFile(new URL('../dist/services/index.html', import.meta.url), 'utf8'));
check($('.service-card').length === 11, 'Overview must show exactly11 services');
check(
  $('#monthly .service-card').length === 7 && $('#one-time .service-card').length === 4,
  'Catalog cadence mismatch',
);
const contact = load(
  await fs.readFile(new URL('../dist/contact/index.html', import.meta.url), 'utf8'),
);
check(contact('option[value="help-choose"]').length === 1, 'Contact must allow undecided service');
console.log(
  JSON.stringify({ servicePages: expected.length, monthly: 7, oneTime: 4, failures }, null, 2),
);
if (failures.length) process.exit(1);
