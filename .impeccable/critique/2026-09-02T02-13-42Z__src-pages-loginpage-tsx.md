---
target: login page (src/pages/LoginPage.tsx + personnel-app/src/components/LoginPage.tsx)
total_score: 19
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 1
timestamp: 2026-09-02T02-13-42Z
slug: src-pages-loginpage-tsx
---
Method: dual-agent (A: general-purpose subagent · B: general-purpose subagent)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Loading swaps button text only; no spinner/icon |
| 2 | Match System / Real World | 4 | Thai labels, standard iconography, real school crest |
| 3 | User Control and Freedom | 3 | Password reveal present; no forgot-password path (acceptable — admin-mediated recovery) |
| 4 | Consistency and Standards | 1 | Two LoginPage copies share only the subtitle string — different palette, shape language, input pattern, and auth logic |
| 5 | Error Prevention | 2 | Only HTML5 `required`; no inline field validation |
| 6 | Recognition Rather Than Recall | 3 | Floating labels legible, but prefix icon fades to `opacity-0` on focus, right when it'd help most |
| 7 | Flexibility and Efficiency | n/a | Single-step daily login; no power-user surface to add |
| 8 | Aesthetic and Minimalist Design | 2 | Continuous dual-gradient animation + heavy glow overshoots this Operate-mode surface's "clarity over flash" principle |
| 9 | Error Recovery | 1 | Wrong credentials render "เชื่อมต่อระบบไม่สำเร็จ" (connection failed) instead of "invalid username/password" |
| 10 | Help and Documentation | n/a | Closed internal system, IT/admin-mediated recovery per product context |
| **Total** | | **19/32** | **Acceptable band (59%)** |

## Design Specificity Verdict

**LLM assessment**: The live LoginPage is genuinely authored — a real school crest, a maroon/gold institutional palette, a custom display font, and a hand-built floating-label pattern using real peer-selector CSS. But it's authored toward the wrong brief: the continuous gradient sweep on both background and headline text, glossy `rounded-2xl`/`shadow-2xl` card, reads as consumer fintech marketing, not an internal Operate-mode tool for school staff of mixed tech literacy. The `personnel-app/` duplicate is the opposite failure — an unstyled shadcn scaffold (flat slate palette, `rounded-none`, generic icon, visible test-credential hint) that reads as a wireframe standing next to a finished product, not a themed sibling.

**Deterministic scan**: `detect.mjs` CLI pass on both files: **0 findings**, exit 0 (regex-only scanner, can't see runtime/animated issues). The injected live detector (browser-side) flagged 4 items on the live page: `gradient-text` on the "Financial" h1 (real — see P3), and 3 likely false positives — 2× `text-occlusion` on the username/password labels, and 1× `dark-glow` on `body`.

**False positives, verified**: Both labels use `pointer-events-none` and sit later in DOM paint order than their input siblings — the occlusion detector's hit-testing reads "input is on top" from `pointer-events:none`, but the annotated screenshot confirms both labels render visibly. The `dark-glow` (`#d97757`) matches no token or CSS rule in the codebase and `getComputedStyle(body).boxShadow` returned `none` on direct check — stale/instrumentation artifact, not a real issue.

**Visual overlays**: Browser evidence was gathered via screenshot and injected-detector console output (no persistent overlay tab was left open — the evidence tab was closed after capture, per the skill's tab-hygiene rule).

## Overall Impression

The craft is real — this isn't a template. But it's solving the wrong problem twice over: the live page over-designs a page daily users will see hundreds of times, and its sibling under-designs the same page to the point of exposing a hardcoded credential. The most urgent issue isn't visual at all — it's that failed login currently tells staff "the system is down," which will generate support calls for a routine typo.

## What's Working

1. **Floating-label CSS** (`placeholder-shown`/`peer` pattern, no JS state) — flicker-free, correct micro-interaction, harder to get right than it looks.
2. **`tabIndex={-1}` on the password-reveal toggle** — a small, easy-to-miss keyboard-order detail that was actually handled.
3. **Institutional specificity** — real crest + maroon/gold palette commits to this school's identity instead of a generic SaaS gradient.

## Priority Issues

**[P0] Wrong-credential submission shows "connection failed," not "invalid username/password"**
Why it matters: `personnel-api.ts` throws on any Supabase RPC error, which `auth-context.tsx`'s catch block turns into the generic "เชื่อมต่อระบบไม่สำเร็จ กรุณาลองใหม่" — the real "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" copy only fires on a *successful* call that returns zero rows. For staff PRODUCT.md describes as mixed tech literacy, "the system is broken" reads very differently from "you mistyped your password" — this generates avoidable help-desk load. Confirmed live (typed wrong credentials, saw the wrong message) and traced to source by both assessments independently.
Fix: In `personnel-api.ts`, distinguish an auth-rejection RPC response from a genuine network/infra error, and route only the latter to the "connection failed" copy.
Suggested command: `/impeccable harden`

**[P1] The two LoginPage files are different products, and one leaks a hardcoded credential**
Why it matters: PRODUCT.md asks to keep the two consistent. In practice they diverge on palette, shape language, icon, input pattern, and button styling — and `personnel-app/src/components/LoginPage.tsx` hardcodes `admin`/`admin123` and prints it on-screen as a visible hint. If that workspace is ever built or deployed, that's a shipped credential.
Fix: Decide first — confirm with the user whether `personnel-app/` is dead code (delete it) or a real target (resync visuals to the live design system and remove the hardcoded credential + on-screen hint).
Suggested command: `/impeccable document` (if kept) or manual removal (if dead)

**[P2] Visual hierarchy inverts task priority; the wordmark is culturally ungrounded**
Why it matters: The header (crest + `text-5xl` animated-gradient "Financial") claims more visual weight than the two actual input fields, which sit in a muted `bg-secondary/40` fill. "Financial" is also the only English word on a screen that's otherwise entirely Thai, with no Thai product name of comparable weight nearby.
Fix: Shrink and calm the header block; raise input field contrast to match or exceed it; add a Thai name near "Financial" or reconsider whether an English wordmark belongs on this surface at all.
Suggested command: `/impeccable layout`

**[P3] Continuous gradient animation ignores `prefers-reduced-motion`**
Why it matters: `animate-gradient-bg` (12s) and `animate-gradient-text` (4s) loop with no reduced-motion guard in `src/index.css`. Users may sit on this screen daily (session re-login) — unthrottled ambient motion with no accommodation is a WCAG 2.3.3 gap. Confirmed independently by the live-injected detector (`gradient-text` finding on the same element).
Fix: Gate both animation classes behind `motion-safe:` or wrap the keyframe usage in a `prefers-reduced-motion: no-preference` media guard.
Suggested command: `/impeccable animate`

## Persona Red Flags

**Jordan (First-Timer, mixed tech literacy — matches PRODUCT.md's stated audience)**: Sees "the system is disconnected" on a simple typo (P0) and has no way to know it's their own mistake — will likely call for help or give up rather than retry. The icon inside each field disappears on focus (fades to `opacity-0`), removing a recognition cue exactly when Jordan is mid-task.

**Sam (Accessibility-dependent)**: The error banner has no `role="alert"`/`aria-live`, so a screen-reader user gets no announcement when a login fails. The password-visibility toggle is an icon-only button with no `aria-label`. Continuous background/text animation has no reduced-motion accommodation (P3).

**Riley (Stress tester)**: Deliberately wrong credentials exposed P0 immediately — the "happy path" (correct login) likely works, but the very next thing a real user tries (a typo) surfaces a message that actively misdescribes the failure.

## Minor Observations

- "FINANCIAL" renders all-caps via the display font's glyph design even though the JSX literal is mixed-case `"Financial"` — a font characteristic, not a bug, but worth knowing before someone "fixes" the casing in source.
- `personnel-app/`'s visible on-screen test-credential hint ("บัญชีทดสอบ: admin / admin123") is itself an issue independent of P1 — even ignoring the duplication problem, no login screen should print a credential.

## Questions to Consider

- Is "Financial" the name staff actually call this tool, or a placeholder nobody replaced yet (PRODUCT.md doesn't name a final product/institution name)?
- Given `personnel-app/` isn't currently served and ships a hardcoded credential, is resyncing its design worth it — or is deletion the fix for both the consistency problem and the exposure risk?
- Does a page staff see every single day need this much ambient motion, or would a calmer, static version of the same palette read as more trustworthy for a government/school document system?
