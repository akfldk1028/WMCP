# ShopGuard Privacy Policy

**Last updated: February 24, 2026**

## Overview

ShopGuard is a Chrome extension that analyzes shopping pages for fake reviews, hidden fees, and dark patterns. Your privacy is important to us.

## Data Collection

ShopGuard does **NOT** collect, store, or transmit any personal data. Specifically:

- **No tracking**: We do not track your browsing history or behavior
- **No analytics**: We do not use any analytics or tracking services
- **No accounts**: No user accounts or registration required
- **No cookies**: We do not set or read any cookies

## Data Processing

When you explicitly trigger an analysis (via Alt+Shift+S or clicking the extension icon):

1. **Page content** (HTML text) of the current tab is read
2. This content is sent to the **Anthropic Claude API** for AI analysis
3. Analysis results are displayed as an overlay on the page
4. **No data is stored** after the analysis is complete

## Data Sent to Third Parties

- **Anthropic API** (api.anthropic.com): Page content is sent to Anthropic's Claude API for analysis when you trigger it. This is governed by [Anthropic's Privacy Policy](https://www.anthropic.com/privacy). Your API key is stored locally in your browser's extension storage and is never shared with us.

## Local Storage

The extension stores only:
- Your Anthropic API key (entered by you in settings)
- Your preferred AI model setting

These are stored locally in Chrome's extension storage and are never transmitted to any server other than Anthropic's API.

## Data Retention

No user data is retained. Analysis results exist only in memory during your browser session.

## Children's Privacy

ShopGuard does not knowingly collect any information from children under 13.

## Changes

We may update this privacy policy. Changes will be posted here with an updated date.

## Contact

For questions about this privacy policy, please open an issue on our GitHub repository.
