// ONE config file. Change values here; every page reads from it.
// Keep this file plain (no type-only syntax): scripts/deploy.mjs imports it directly.
export default {
  name: 'Rolling Offset Calculator',                 // shown in header, title, footer
  domain: 'rollingoffsetcalculator.com',            // no https://, no www. Used for canonical, sitemap, robots
  cloudflareProject: 'rolling-offset-calculator',    // Cloudflare Pages project name (used by npm run deploy)
  keyword: 'rolling offset calculator', // main keyword (used in page text planning)
  title: 'Rolling Offset Calculator for Pipe and EMT Conduit', // home page title (under 60 characters)
  h1: 'Rolling Offset Calculator',
  tagline: 'Free. Works on your phone.',  // short line shown above the heading
  description:
    'Free rolling offset calculator for pipe and EMT conduit. Get true offset, travel, run, shrink and cut length to 1/16 inch. No sign-up.',
  email: 'hello@rollingoffsetcalculator.com',       // contact email (shown on Contact and Privacy pages)
  ga4: '',                            // GA4 measurement ID, e.g. 'G-XXXXXXXXXX'. Empty = Google Analytics off
  adsense: '',                        // AdSense publisher ID, e.g. 'ca-pub-1234567890123456'. Empty = ads off
  brand: '#a84c08',                   // brand color (hex). Dark enough for 4.5:1 contrast with white text
  locale: 'en-US',                    // BCP 47 language tag
  ogImage: 'og.png',                         // file in public/ (1200x630), no leading slash. Empty = no image
  ogAlt: 'Rolling offset calculator for pipe and EMT conduit',  // alt text for the preview image
  category: 'UtilitiesApplication',   // schema.org applicationCategory
  owner: 'Rolling Offset Calculator',                // name used in legal pages (person or business)
};
