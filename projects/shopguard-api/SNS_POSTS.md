# ShopGuard Social Media Posts

Ready-to-copy posts for promotion across platforms.

---

## Twitter/X Posts

### 1. Leaderboard Announcement

```
We scanned the top shopping sites for dark patterns.

Temu: F grade (11 dark patterns found)
Apple Store: A grade (1 pattern)

See the full leaderboard:
https://shopguard-api.vercel.app/leaderboard
```

### 2. Fakespot Shutdown Alternative

```
Fakespot shut down in July 2025, leaving 10M users without fake review protection.

ShopGuard picks up where Fakespot left off — and adds dark pattern + hidden fee detection on top.

Free Chrome extension:
https://chrome.google.com/webstore/detail/befjaannnnnhcnmbgjhcakhjgmjcjklf
```

### 3. Dark Pattern Awareness

```
14 types of dark patterns exist on shopping sites. Fake urgency, confirm-shaming, drip pricing, disguised ads...

Most shoppers can't spot them. We built a free tool that detects all 14 automatically.

https://shopguard-api.vercel.app/blog/dark-patterns-guide
```

### 4. Chrome Extension Launch

```
ShopGuard is live on the Chrome Web Store.

It scans any shopping page and gives you a trust grade from A to F. Fake reviews, hidden fees, dark patterns — all detected in seconds.

100% free. No account needed.

https://chrome.google.com/webstore/detail/befjaannnnnhcnmbgjhcakhjgmjcjklf
```

### 5. Blog Post Promotion

```
We documented 15 real dark pattern examples from Amazon, Booking.com, Walmart, and more.

Countdown timers that reset. Pre-checked insurance boxes. "No thanks, I hate saving money" buttons.

Full breakdown:
https://shopguard-api.vercel.app/blog/dark-pattern-examples-shopping
```

---

## Reddit Posts

### 1. r/assholedesign

**Title:** We scanned 30+ shopping sites for dark patterns and ranked them. Here are the results.

**Body:**

I built a tool that detects dark patterns on shopping sites automatically. After scanning dozens of major e-commerce platforms, I compiled the results into a public leaderboard.

Some findings that might interest this community:

- **Temu scored an F grade** with 11 distinct dark pattern types detected on a single product page. Fake urgency timers, fake social proof counters, confirm-shaming on popups, pre-checked add-ons, and drip pricing through checkout.
- **Apple Store scored an A grade** with only 1 pattern detected (minor preselection in the accessories flow).
- Most major retailers fall in the C to D range. Amazon, eBay, and Walmart all use 4-7 dark pattern types consistently.

The 14 pattern types the tool checks for: fake urgency, fake social proof, confirm-shaming, misdirection, preselection, forced continuity, obstruction, hidden costs, privacy zuckering, bait-and-switch, drip pricing, nagging, trick questions, and disguised ads.

The leaderboard is public and updated as more sites get scanned: https://shopguard-api.vercel.app/leaderboard

The detection engine is open source (shopguard-mcp on npm) if anyone wants to look at the methodology or run their own scans. The Chrome extension that runs the scans is free with no account required: https://chrome.google.com/webstore/detail/befjaannnnnhcnmbgjhcakhjgmjcjklf

I am a solo developer who built this after getting frustrated with how normalized these manipulation tactics have become. Happy to answer questions about how specific patterns are detected or discuss the methodology.

---

### 2. r/darkpatterns

**Title:** I built a free Chrome extension that detects 14 types of dark patterns on shopping sites — here is what I found

**Body:**

After spending months cataloguing dark patterns on e-commerce sites, I built ShopGuard, a Chrome extension that detects them automatically and grades sites from A to F.

Here is what surprised me during development:

**Fake urgency is universal.** Nearly every major shopping site uses some form of it. "Only X left in stock" on Amazon, "Booked N times today" on Booking.com, countdown timers on fashion retailers that reset when you refresh. The techniques vary but the psychological mechanism is the same: create time pressure so you skip careful evaluation.

**Confirm-shaming is getting worse, not better.** The decline buttons are increasingly creative: "No thanks, I prefer paying full price," "I do not want to protect my purchase," "Skip and miss out." Every one of these is designed to make the rational choice (declining) feel emotionally costly.

**Drip pricing is the most financially damaging pattern.** A 2025 FTC report estimated surprise fees cost U.S. consumers $24 billion per year. The technique is effective because each individual fee seems small, but they compound. A $30 item becomes $45 by checkout.

The tool currently detects: fake urgency, fake social proof, confirm-shaming, misdirection, preselection, forced continuity, obstruction, hidden costs, privacy zuckering, bait-and-switch, drip pricing, nagging, trick questions, and disguised ads.

Full leaderboard of site grades: https://shopguard-api.vercel.app/leaderboard

Detailed breakdown of all 14 pattern types with real examples: https://shopguard-api.vercel.app/blog/dark-patterns-guide

The analysis engine is open source on npm (shopguard-mcp) and the extension is free: https://chrome.google.com/webstore/detail/befjaannnnnhcnmbgjhcakhjgmjcjklf

Would love feedback from this community on patterns I might be missing or sites that should be added to the leaderboard.

---

### 3. r/privacy

**Title:** Shopping sites use 14 types of manipulation tactics against you. Here is a free tool that exposes them.

**Body:**

I have been building a Chrome extension called ShopGuard that detects dark patterns and manipulative design on shopping sites. I wanted to share some findings with this community because several of the patterns I detect are directly related to privacy.

**Privacy-relevant patterns found on major sites:**

- **Privacy zuckering:** Sign-up flows that bundle broad data sharing consent into a generic "Continue" button. You agree to data collection without realizing it because the consent is embedded in an action you were going to take anyway.
- **Misdirection on cookie banners:** The "Accept All" button is large, colored, and prominent. The "Manage Preferences" or "Reject" option is a small gray text link, sometimes requiring additional clicks. This is not accidental design — it is optimized to maximize data collection consent rates.
- **Forced account creation:** Some sites require account creation (with email, name, and sometimes phone number) to complete a purchase or even to view prices. The data collected goes far beyond what is needed for the transaction.
- **Pre-checked marketing consent:** Newsletter subscriptions and "partner offers" checkboxes that are checked by default during checkout. If you do not notice and uncheck them, you have "consented" to marketing communications.

The extension scans pages locally and flags these patterns in real time. It does not collect your browsing data, does not require an account, and the core analysis engine is open source (shopguard-mcp on npm).

After scanning 30+ major shopping sites, I published the results in a public leaderboard: https://shopguard-api.vercel.app/leaderboard

Temu scored an F with 11 dark pattern types. Apple Store scored an A with 1. Most major retailers fall in the C-D range.

Chrome extension (free, no account): https://chrome.google.com/webstore/detail/befjaannnnnhcnmbgjhcakhjgmjcjklf

I built this as a solo developer. The code runs analysis on your machine, not on a remote server (except for the optional AI scan, which is rate-limited to 5/day). Feedback on the privacy approach is welcome.

---

## LinkedIn Post

**Dark patterns cost online shoppers $24 billion per year. Most people have no idea they exist.**

Dark patterns are deceptive design techniques embedded in websites and apps. They create false urgency, hide fees until checkout, pre-select expensive add-ons, and use shame-based language to prevent you from declining offers.

After the EU Digital Services Act (2025) and South Korea's updated e-commerce regulations, these practices are now illegal in major markets. But enforcement is slow, and the techniques are becoming more sophisticated.

I spent months analyzing 30+ major shopping sites and cataloguing every dark pattern I could find. The results are striking:

- Some platforms use 11+ distinct manipulation tactics on a single product page
- Drip pricing (revealing costs gradually through checkout) is the most financially damaging pattern
- Fake urgency and fake social proof are nearly universal across e-commerce
- Confirm-shaming ("No thanks, I prefer paying full price") is becoming more aggressive, not less

I built ShopGuard to make this visible. It is a Chrome extension that scans any shopping page and grades it from A (trustworthy) to F (high risk) based on 14 dark pattern categories. The analysis engine is open source on npm.

The full site leaderboard is public: https://shopguard-api.vercel.app/leaderboard

For anyone working in e-commerce, UX, consumer protection, or compliance: these findings matter. The regulatory direction is clear. Sites that rely on dark patterns for conversion will face increasing legal and reputational risk.

ShopGuard is free for shoppers. The developer API is available for businesses that want to audit their own sites.

https://shopguard-api.vercel.app

---

## Hacker News

**Title:** Show HN: ShopGuard -- Dark pattern detector for shopping sites (grades A to F)

**Comment:**

I built ShopGuard to detect dark patterns on e-commerce sites. It is a Chrome extension that scans product pages and assigns a trust grade from A to F based on 14 categories of manipulative design.

The detection runs locally in the browser using DOM analysis and pattern matching. An optional AI scan (5/day free) provides deeper analysis via API. The core analysis engine is published as shopguard-mcp on npm.

Technical details:
- Scans for fake urgency (countdown timers, stock warnings), fake social proof, confirm-shaming, preselection, drip pricing, disguised ads, and 8 other pattern types
- Works on 30+ shopping sites (Amazon, eBay, Walmart, Temu, Coupang, AliExpress, etc.)
- No data collection, no account required
- Built with TypeScript, Next.js API routes, Vercel KV for rate limiting

Interesting findings from scanning major sites: Temu scores an F with 11 dark pattern types on a typical product page. Apple Store scores an A with 1. Most major retailers are in the C-D range.

Leaderboard: https://shopguard-api.vercel.app/leaderboard
Chrome extension: https://chrome.google.com/webstore/detail/befjaannnnnhcnmbgjhcakhjgmjcjklf
Landing page: https://shopguard-api.vercel.app
Blog with detailed examples: https://shopguard-api.vercel.app/blog

Solo developer. Happy to discuss the detection methodology or answer technical questions.
