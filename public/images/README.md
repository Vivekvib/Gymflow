# Photos for the public website

The landing page has no photography built in. Add your own, then point to it
in `src/config/marketing.ts`.

1. Put the image file in this folder (for example `hero.jpg`).
2. In `src/config/marketing.ts`, set the matching slot:
   `hero: "/images/hero.jpg"`.
3. Redeploy.

| Slot | Where it appears | Suggested size |
|---|---|---|
| `hero` | Full-width background of the top section | 2000 x 1200, landscape |
| `aboutLeft`, `aboutRight` | Either side of the About points (set **both** or neither) | 1000 x 1250, portrait |
| `services.plans` / `strength` / `cardio` / `progress` | The four Training cards | 800 x 1000, portrait |
| `cta` | Background of the closing banner | 2000 x 1000, landscape |

Tips

- Use photos you own or have a licence for. Real photos of your own gym and
  members (with their permission) will look better than anything generic.
- Keep each file under about 300 KB (export as JPG or WebP at roughly 75 to
  80 percent quality). Large originals make the page slow on mobile data.
- Dark, high-contrast photos work best; a dark overlay is added so the white
  text on top stays readable.
