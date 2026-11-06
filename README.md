# John Benedict Macatangay — Data & Software

A personal portfolio for a Computer Science student seeking a Data Engineering internship. The content is based on the supplied resume and original project screenshots, with expanded descriptions that distinguish individual contributions, team work, ongoing development, and test results.

## Run

Requires Node.js. No package installation is needed.

```sh
npm run dev
```

Open http://localhost:3000. Use the `PORT` environment variable to choose another port. Run `npm run check` for JavaScript syntax checks.

## Content and assets

- `index.html`: biography, project gallery, certifications, pipeline walkthrough, skills, education, experience, and contact links.
- `app.js`: the three project case studies, modal interactions, filters, email-copy feedback.
- `assets/john-benedict-macatangay.png`: the supplied professional portrait.
- `assets/weatherph.png`, `assets/chargeph.png`, and `assets/docuflow.png`: the supplied project screenshots, shown without color filters or compositing changes.
- `assets/John-Benedict-Macatangay-Resume.docx`: an unchanged copy of the original resume for download.
- Email, LinkedIn, and GitHub links come from the resume. Project-specific repository or deployment URLs were not supplied; the case studies link to the GitHub profile.
- DocuFlow is described as a team-of-four thesis project. The 4.24/5 ease-of-use rating, 62 evaluators, approximately 0.12-second response time, and 50 simultaneous test users retain their evaluation context.
- ChargePH is marked ongoing, and the screenshot's station count is identified as dataset coverage.

The original sample identity, awards, showreel, and color-grading demonstration have been replaced. Older sample media files are no longer referenced by the site.

## Design

Ice silver `#DDE3E8` is the main canvas, with deep aubergine `#3A0F34` typography, orchid pink `#EAAADD`, and marigold `#EAA221` accents. Supporting text tones maintain contrast on the light background. Fonts and images are bundled locally. The background has no grain or haze overlay.

## Entry animation

`live-canvas.js` and `live-canvas.css` run a decorative build sequence once per page load: 18 cursors on desktop, 10 on tablet, and 6 on mobile. Each view starts blank, then collaborators draw in content before the automatic tour advances. Long sections receive intermediate stops. After the final contact phase, the visible cursors burst into particles, and the overlay, animation loop, listeners, and observers are removed.

Manual scrolling, touch, clicking, Escape, or keyboard browsing ends the intro and reveals all content. Reduced-motion preferences skip the intro entirely. Without JavaScript, all content remains visible. There are no bottom replay controls.

## Credential evidence

The Credentials section includes the four original certificate PDFs in `assets/certificates/`, unchanged from the supplied files. Matching PNG previews were rendered from their first pages. SAP links to the Credly badge embedded in its certificate, and the Python and PMI entries link to the Certiport verification portal and show the certificate's verification code. The Cisco item is labeled as course completion, not a full CCNA certification. Issue/completion dates and SAP's expiry date are transcribed from the PDFs.

The desktop navigation is centered independently of the right-aligned internship status. Mobile retains the collapsible menu.
