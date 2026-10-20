// ONE config file. Change values here; every page reads from it.
// Keep this file plain (no type-only syntax): scripts/deploy.mjs imports it directly.
export default {
  name: 'Rolling Offset Calculator',                 // shown in header, title, footer
  domain: 'rollingoffsetcalculator.com',            // no https://, no www. Used for canonical, sitemap, robots
  cloudflareProject: 'rolling-offset-calculator',    // Cloudflare Pages project name (used by npm run deploy)
  keyword: 'rolling offset calculator', // main keyword
  title: 'Rolling Offset Calculator for Pipe and EMT Conduit', // home page title (under 60 characters)
  h1: 'Rolling Offset Calculator',
  keywords: ['rolling offset calculator emt', 'pipe rolling offset', 'conduit rolling offset', 'true offset calculator', 'rolling offset travel', 'offset shrink calculator'], // supporting keywords
  tagline: 'Free. Works on your phone.',  // short line shown above the heading
  description:
    'Free rolling offset calculator for pipe and EMT conduit. Get true offset, travel, run, shrink and cut length to 1/16 inch. No sign-up.',
  email: 'hello@rollingoffsetcalculator.com',       // contact email (shown on Contact and Privacy pages)
  ga4: '',                            // GA4 measurement ID, e.g. 'G-XXXXXXXXXX'. Empty = Google Analytics off
  adsense: '',                        // AdSense publisher ID, e.g. 'ca-pub-1234567890123456'. Empty = ads off
  brand: '#b4540a',                   // brand colour (hex)
  locale: 'en-US',                    // BCP 47 language tag
  ogImage: '/og.png',                        // e.g. '/og.png' (1200x630 file in public/). Empty = no image
  category: 'UtilitiesApplication',   // schema.org applicationCategory
  owner: 'Rolling Offset Calculator',                // name used in legal pages (person or business)
};
