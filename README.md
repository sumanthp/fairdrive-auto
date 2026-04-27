# FairDrive Auto

FairDrive Auto is an AI-native auto insurance prototype for immigrants, H1B workers, international students, and first-time U.S. drivers who often face high premiums because they lack prior U.S. insurance history.

The product starts with the user's car and driving story instead of a long insurance form. It combines a 3D vehicle garage, an Insurance Passport, quote explanation, pre-purchase insurance estimates, and a premium reduction coach.

## Product Promise

FairDrive does not guarantee lower premiums. The safer product promise is:

> Understand why your auto insurance is expensive, organize stronger evidence, and find a path toward better options where available.

## Current Prototype

- Marketing page for the product story
- App-style dashboard
- Three.js 3D vehicle garage
- Vehicle selector for Accord, Camry, BMW 330i, Tesla Model 3, and Honda CR-V
- AI quote explainer placeholder
- Insurance Passport skeleton
- Before-you-buy insurance estimator
- Premium reduction coach
- Local static Node server

## Tech Stack

- HTML
- CSS
- JavaScript
- Three.js loaded from CDN
- Node.js static server

No package installation is required for the current prototype.

## Run Locally

```powershell
cd C:\Users\suman\github_repos\fairdrive
node server.js
```

Open:

```text
http://localhost:4273
```

Marketing page:

```text
http://localhost:4273/marketing.html
```

The 3D viewer imports Three.js from a CDN, so the browser needs internet access.

## Project Files

- `index.html` - app prototype
- `marketing.html` - marketing page
- `styles.css` - shared app and marketing styles
- `app.js` - app interactions
- `car-viewer.js` - Three.js 3D garage
- `server.js` - local static server

## MVP Roadmap

1. Bundle the frontend with Vite, React, or Next.js.
2. Replace CDN Three.js with a local dependency.
3. Replace procedural 3D vehicles with licensed or generated `.glb` models.
4. Add authentication and persisted user profiles.
5. Implement Insurance Passport document upload.
6. Add OCR and structured extraction for uploaded quotes and policies.
7. Add AI quote explanation with guarded, source-backed responses.
8. Build licensed-agent handoff and partner quote request workflow.
9. Replace estimator mock data with market-informed estimates.
10. Add telematics only after the quote/passport flow proves demand.

## Compliance Notes

- Avoid promising guaranteed savings.
- Keep immigration documents optional unless legally required.
- Do not use immigration status directly for pricing unless legally approved.
- Add licensed-agent handoff before giving regulated product recommendations.
- Use explicit consent for document upload, AI processing, and partner sharing.

## License

This project is licensed under the **Apache License 2.0 with Commons Clause v1.0**. 

This means:
- **Free for personal and internal use.**
- **No Commercial Sale/Hosting:** You cannot sell the software or provide it as a paid service (e.g., hosting, support, or consulting where the value is derived substantially from the software) without explicit permission.
- **Licensor retains all rights:** The original author (Sumanth Polisetty) retains the right to distribute and sell the software commercially.

See the [LICENSE](LICENSE) file for the full text.

## One-Line Pitch

FairDrive Auto helps new-to-U.S. drivers understand expensive premiums, build an auto insurance profile, and find a path toward fairer options.
