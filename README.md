# Stayfinder

A small Express, EJS, and MongoDB stay listing app with guest and host accounts.

## Run locally

1. Install Node.js and MongoDB, then run `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and a long random `SESSION_SECRET`.
3. Start the server with `npm start` and open http://localhost:7000.

The app serves its own stylesheet from `public/home.css`; Tailwind is not required at runtime.

## Features

- Guest and host registration with password hashing and validation.
- Searchable home listings, listing detail pages, and image uploads (JPG, PNG, WebP, up to 5 MB).
- Per-host listing management and ownership checks.
- Guest favourites and dated reservations with a calculated total price.
- Responsive layout for mobile and desktop.

Existing homes created before host ownership was added remain visible in the public explore pages. They do not appear in a host dashboard because no owner can be inferred for those records.
