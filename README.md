# Ultimate Promo Builder — protected Vercel package

This package keeps the builder HTML outside the public folder. Buyers enter the individual license key from their Gumroad receipt. A Vercel server function verifies the key with Gumroad before serving the builder.

## Before deployment

1. In Gumroad, open the Ultimate Promo Builder product and enable **Generate a unique license key per sale**.
2. Copy the product ID. Gumroad's license API requires the `product_id` for products created after January 9, 2023.
3. Create a long random cookie secret. A password manager can generate one of at least 40 characters.

## Deploy to Vercel

1. Put this folder in a GitHub repository, or import it with the Vercel CLI.
2. Create a new Vercel project from the repository.
3. In **Project Settings → Environment Variables**, add:
   - `GUMROAD_PRODUCT_ID` — the Gumroad product ID.
   - `LICENSE_COOKIE_SECRET` — the random secret created above.
4. Deploy.
5. Test with a real Gumroad test purchase/license before sharing the URL.

## Recommended domain

Connect `ultimate.empowertools.org` to the Vercel project. Keep `www.empowertools.org/monetization-promo-builder` as the public sales page.

## Gumroad product content

Add a button labeled **Launch the Ultimate Promo Builder** pointing to the Vercel domain. Tell buyers to copy the license key from their receipt and paste it on the access screen. Do not link buyers to the Wix `/ultimate` page.

## Important

- Password-protect or remove the public Wix `/ultimate` page before launch.
- The access cookie lasts 30 days. The builder re-verifies the Gumroad license whenever it is opened, so refunded or invalidated purchases stop working.
- The original builder remains unchanged in `private/Ultimate-Promo-Builder.html`.
- Browser-based software cannot be made impossible to copy, but this prevents casual URL sharing and keeps the public route from serving the builder without a valid license.
