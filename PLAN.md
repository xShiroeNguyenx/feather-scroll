# PLAN — Thư viện Carousel/Scroll thế hệ mới (working name: **FeatherScroll**)

> Mục tiêu: một thư viện carousel/scroll **nhẹ hơn owl-carousel**, **đầy đủ tính năng**, và có **ít nhất 100 kiểu scroll (hiệu ứng layout)** để lựa chọn.
>
> Tên `FeatherScroll` (package: `feather-scroll`) là tên tạm — "nhẹ như lông vũ" để đối lập với "owl". Có thể đổi (xem mục [20. Câu hỏi mở](#20-câu-hỏi-mở--quyết-định-cần-chốt)).

---

## ✅ TRẠNG THÁI THỰC THI (M0 → M6 đã hoàn tất)

| Milestone | Trạng thái | Kết quả thực tế |
|---|---|---|
| M0 — Monorepo pnpm | ✅ | TS, tsup, ESLint, Vitest, CI, size-limit, MIT |
| M1 — Core MVP | ✅ | engine rAF, drag, nav/dots, autoplay, responsive, native mode |
| M2 — Tính năng owl | ✅ | loop ring-based, center, stagePadding, gap, RTL, a11y + 4 plugin |
| M3+M4 — 105 hiệu ứng | ✅ | 11 family, **đúng 105 effect**, test render+loop toàn bộ |
| M5 — Wrappers + docs | ✅ | React/Vue/Svelte/Web Component, gallery live, migration guide |
| M6 — Hardening 1.0 | ✅ | bundle core **6.56KB**, 105 effect **5.88KB** gz; 19 test pass |
| **M7 — Product scroll patterns** | ✅ | dragFree momentum + autoWidth + grid + scrollTo/progress + event `scroll`; 4 plugin (autoScroll/mousewheel/scrollbar/virtual); package `@feather-scroll/presets` (8 preset); 5 recipe. **42 test pass**, core **7.89KB** gz, mỗi plugin ≤0.7KB. Chi tiết [§20](#20-m7--product-scroll-patterns-kế-hoạch-mở-rộng-) |

**Verify:** `pnpm lint` ✅ · `pnpm typecheck` ✅ · `pnpm test` (19) ✅ · `pnpm build` (6 package) ✅ · `pnpm size` ✅.
Demo: `examples/gallery/index.html` (chọn 1/105 hiệu ứng live).

---

## 1. Tổng quan & mục tiêu

| Tiêu chí | owl-carousel 2 | FeatherScroll (mục tiêu) |
|---|---|---|
| Dependency | **Bắt buộc jQuery** (~30KB gz) | **Zero dependency** |
| Core JS (gzip) | ~13KB + jQuery 30KB = **~43KB** | **< 8KB** core |
| Ngôn ngữ | jQuery plugin (ES5) | **TypeScript**, output ESM/UMD/IIFE |
| Tree-shaking | Không | **Có** — chỉ import effect bạn dùng |
| Số hiệu ứng | ~vài (slide/fade + animate.css) | **100+ preset** + engine tự custom |
| Mobile/touch | Có | Có + native `scroll-snap` mode |
| A11y | Hạn chế | WCAG 2.1, `prefers-reduced-motion`, keyboard, ARIA |
| Framework | jQuery | Vanilla + wrapper React/Vue/Svelte/Web Component |

**3 yêu cầu cốt lõi của user:**
1. ✅ Nhúng vào phải **nhẹ hơn** owl-carousel → bỏ jQuery, core nhỏ, hiệu ứng opt-in.
2. ✅ **Đầy đủ tính năng** carousel → ánh xạ 1-1 mọi tính năng owl + bổ sung.
3. ✅ **≥ 100 kiểu scroll** (layout) → catalog 105 hiệu ứng (mục 7) dựng trên một effect-engine nhỏ.

---

## 2. Phân tích đối thủ & định vị

**owl-carousel** mạnh ở: responsive breakpoints, drag/touch, autoplay, nav/dots, loop, lazy load, auto height, RTL, center mode, stage padding, animate in/out, video lazy, URL hash, merge, callbacks.

**Điểm yếu để mình vượt:**
- Phụ thuộc jQuery → nặng, lỗi thời.
- Không tree-shake → tải hết dù chỉ dùng 1 tính năng.
- Ít hiệu ứng layout sẵn, muốn đẹp phải kéo thêm animate.css.
- API kiểu jQuery, khó dùng với framework hiện đại / SSR.

**Định vị FeatherScroll:** "owl-carousel nhưng vanilla, tree-shakeable, và có thư viện 100+ hiệu ứng layout."

---

## 3. Nguyên tắc thiết kế (Design principles)

1. **Core tối giản, hiệu ứng là plugin.** Core chỉ lo: DOM/stage, state, pointer/drag, autoplay, breakpoint, event, a11y. Mọi hiệu ứng nạp riêng → bundle thực tế = core + đúng những gì dùng.
2. **GPU-only animation.** Chỉ animate `transform` + `opacity` + `clip-path`. Tránh layout thrash (không animate `left/top/width`).
3. **Hai chế độ render** (mục 4.3): *Transform mode* (JS điều khiển, hiệu ứng 3D) và *Native scroll-snap mode* (CSS thuần, cực nhẹ + momentum gốc của trình duyệt).
4. **CSS-first khi có thể.** Nhóm hiệu ứng wipe/clip/tiles làm bằng CSS class → JS gần như 0 chi phí.
5. **Declarative & composable.** Một hiệu ứng = một hàm thuần `(ctx) => styles` hoặc một bộ CSS keyframes; dễ tự viết hiệu ứng mới.
6. **Progressive enhancement.** Không JS / `reduced-motion` → vẫn xem được nội dung (fallback scroll-snap hoặc grid tĩnh).
7. **Framework-agnostic.** Lõi vanilla; wrapper mỏng cho mỗi framework.

---

## 4. Kiến trúc tổng thể

### 4.1. Sơ đồ module

```
feather-scroll/
├─ core/                # < 8KB gzip — luôn cần
│  ├─ Carousel.ts       # class chính, vòng đời, public API
│  ├─ state.ts          # index, breakpoint hiện tại, trạng thái drag
│  ├─ dom.ts            # tạo stage/track/clones, đo đạc (cache)
│  ├─ pointer.ts        # drag/swipe (Pointer Events, passive)
│  ├─ autoplay.ts       # timer + pause on hover/blur/offscreen
│  ├─ responsive.ts     # breakpoints qua ResizeObserver
│  ├─ events.ts         # event bus (on/off/emit)
│  ├─ a11y.ts           # ARIA, keyboard, focus, reduced-motion
│  └─ effect-engine.ts  # interface + scheduler cho effect
├─ effects/             # opt-in, tree-shakeable (mỗi file 0.3–1.5KB)
│  ├─ slide.ts  fade.ts  zoom.ts  flip.ts  cube.ts
│  ├─ coverflow.ts  cards.ts  parallax.ts ...
│  └─ index.ts          # gom tất cả (chỉ dùng khi muốn "all-in")
├─ plugins/             # opt-in tính năng nâng cao
│  ├─ lazyload.ts  video.ts  hash.ts  thumbnails.ts  autoheight.ts
├─ styles/
│  ├─ core.css          # < 2KB — layout cơ bản, biến CSS
│  └─ effects/*.css     # CSS cho nhóm hiệu ứng CSS-driven
└─ adapters/            # wrapper framework
   ├─ react/  vue/  svelte/  web-component/
```

### 4.2. Effect Engine (trái tim của 100+ hiệu ứng)

Một hiệu ứng là một object cài đặt interface:

```ts
interface Effect {
  name: string;
  mode?: 'transform' | 'css' | 'hybrid';
  // setup chạy 1 lần: thêm class, set perspective cho container...
  setup?(ctx: EffectContext): void;
  // gọi mỗi frame khi đang chuyển/drag; progress ∈ [-n..n]
  render?(ctx: EffectContext): void;
  teardown?(ctx: EffectContext): void;
}

interface EffectContext {
  slides: HTMLElement[];
  current: number;        // index hiện tại (số thực khi drag)
  progress: number;       // tiến trình chuyển 0→1 (hoặc theo drag)
  size: { w: number; h: number };
  rtl: boolean;
  settings: Options;
  setStyle(el: HTMLElement, styles: Partial<CSSStyleDeclaration>): void;
}
```

- **Transform-mode effect**: tính `transform`/`opacity` cho từng slide theo `progress` (cube, coverflow, flip…). Core gọi `render` trong rAF loop khi drag, và một lần khi animate bằng CSS transition.
- **CSS-mode effect**: chỉ toggle class `fs-effect--wipe-left` v.v.; trình duyệt lo animation. JS không tính per-frame → rất nhẹ.
- **Hybrid**: kết hợp (vd parallax cần JS theo scroll + CSS cho layer).

→ Nhờ tách biệt này, thêm 1 hiệu ứng = thêm 1 file nhỏ, **không phình core**.

### 4.3. Hai chế độ scroll

| Mode | Cách hoạt động | Ưu | Khi dùng |
|---|---|---|---|
| **Transform** | JS set `translate3d` trên track + effect render | Mọi hiệu ứng 3D/creative, kiểm soát tuyệt đối | Hiệu ứng phức tạp |
| **Native snap** | CSS `scroll-snap-type` + `overflow:auto` | Momentum gốc, cực nhẹ, accessible mặc định | List ảnh, mobile, hiệu ứng đơn giản |

Core tự chọn theo `effect` (hoặc user ép `renderMode`).

---

## 5. Tính năng đầy đủ (đối chiếu owl + bổ sung)

**Ngang owl-carousel:**
- [ ] Responsive breakpoints (object `responsive`)
- [ ] `items` (số item/view), `slideBy`
- [ ] Touch/swipe + mouse drag, `mouseDrag`, `touchDrag`
- [ ] `loop` / infinite (clone slides), `rewind`
- [ ] Autoplay: interval, `autoplayHoverPause`, `autoplayTimeout`, speed
- [ ] Nav (prev/next), `navText`, custom container
- [ ] Dots/pagination, `dotsEach`, custom
- [ ] `center` mode, `stagePadding`, `margin`
- [ ] `autoHeight`, `autoWidth`
- [ ] `lazyLoad`
- [ ] RTL
- [ ] `startPosition`, `URLhashListener` (hash nav)
- [ ] `merge` (item rộng khác nhau)
- [ ] `animateIn`/`animateOut` (CSS animation tùy chọn)
- [ ] Video lazy load (YouTube/Vimeo/HTML5)
- [ ] Callbacks/events đầy đủ

**Bổ sung (vượt owl):**
- [ ] 100+ hiệu ứng layout sẵn (mục 7)
- [ ] Native scroll-snap mode
- [ ] Thumbnails / sync 2 carousel
- [ ] Virtualization cho list cực dài (chỉ render slide quanh viewport)
- [ ] Free-scroll / momentum (kéo trớn không snap)
- [ ] Progress bar, autoplay progress indicator
- [ ] Vertical mode, multi-row/grid mode
- [ ] `prefers-reduced-motion` tự tắt animation
- [ ] Wheel/trackpad scroll, keyboard nav đầy đủ
- [ ] IntersectionObserver: pause autoplay khi ngoài màn hình
- [ ] Hooks/middleware để chèn logic
- [ ] SSR-safe (không đụng `window` khi import)

---

## 6. Catalog 100+ hiệu ứng scroll (layout)

> Dựng trên ~12 "family". Mỗi family + modifier (direction/easing/depth) sinh nhiều preset có tên. Dưới đây liệt kê **105 preset** đặt tên cụ thể (đã > 100). Easing chung: `linear / ease / spring / bounce / elastic / back`.

### A. Slide / Linear (12)
`slide-horizontal`, `slide-vertical`, `slide-diagonal-tlbr`, `slide-diagonal-trbl`, `slide-rubber`, `slide-bounce`, `slide-back`, `slide-spring`, `slide-momentum`, `slide-step`, `slide-stagger`, `marquee-ticker`

### B. Fade (8)
`fade`, `fade-scale-up`, `fade-scale-down`, `fade-blur`, `fade-zoom-blur`, `cross-fade`, `fade-slide`, `fade-rotate`

### C. Zoom (8)
`zoom-in`, `zoom-out`, `zoom-rotate`, `zoom-blur-spin`, `ken-burns`, `zoom-punch`, `zoom-iris`, `zoom-perspective`

### D. Flip 3D (10)
`flip-x`, `flip-y`, `flip-diagonal`, `flip-card`, `fold`, `fold-vertical`, `door-open`, `book-flip`, `flip-stack`, `flip-corner`

### E. Cube / Box (8)
`cube-horizontal`, `cube-vertical`, `cube-inside`, `cube-outside`, `box-rotate`, `cylinder`, `ring-3d`, `sphere-wrap`

### F. Coverflow / Perspective (10)
`coverflow`, `coverflow-shadow`, `coverflow-tilt`, `coverflow-depth`, `perspective-wall`, `perspective-corridor`, `fan`, `fan-deck`, `wheel-rotary`, `helix`

### G. Cards / Stack (10)
`stack-tinder`, `stack-deck`, `stack-fan`, `stack-vertical`, `stack-rotate`, `cards-shuffle`, `cards-pile`, `cards-peek`, `cards-spread`, `cards-flip-through`

### H. Parallax (8)
`parallax-horizontal`, `parallax-vertical`, `parallax-layers`, `parallax-zoom`, `parallax-fade`, `parallax-tilt`, `parallax-cover`, `parallax-reveal`

### I. Wipe / Clip-path (12) — *CSS-mode, rất nhẹ*
`wipe-left`, `wipe-right`, `wipe-up`, `wipe-down`, `iris-open`, `iris-close`, `diamond-wipe`, `split-wipe`, `curtain`, `shutter-h`, `shutter-v`, `wedge-radial`

### J. Tiles / Mosaic (10)
`tiles-fade`, `tiles-flip`, `tiles-rotate`, `tiles-scale`, `tiles-wave`, `tiles-ripple`, `blinds-h`, `blinds-v`, `checkerboard`, `mosaic-shatter`

### K. Creative / Special (9)
`page-peel`, `glitch`, `liquid-displace`, `morph-clip`, `swirl`, `push`, `pull`, `cover`, `uncover`

**Tổng: 12+8+8+10+8+10+10+8+12+10+9 = 105 preset (> 100 ✅).**

> Ngoài preset, user tự tạo hiệu ứng bằng cách implement `Effect` interface, hoặc dùng `creative` effect với cấu hình transform per-slide (kiểu Swiper "creative effect") để sinh vô hạn biến thể.

---

## 7. API design (dự kiến)

```ts
import Carousel from 'feather-scroll';
import { coverflow } from 'feather-scroll/effects';
import { lazyload } from 'feather-scroll/plugins';
import 'feather-scroll/styles/core.css';

const c = new Carousel('#gallery', {
  effect: coverflow,            // hoặc 'coverflow' nếu import bản all-in
  items: 3,
  margin: 16,
  loop: true,
  center: true,
  autoplay: { delay: 3000, pauseOnHover: true },
  speed: 500,
  easing: 'spring',
  nav: true,
  dots: true,
  drag: true,
  rtl: false,
  responsive: {
    0:    { items: 1 },
    768:  { items: 2 },
    1200: { items: 4 },
  },
  plugins: [lazyload()],
});

// Methods
c.next(); c.prev(); c.to(3); c.refresh(); c.destroy();
c.play(); c.stop();

// Events
c.on('change', ({ index }) => {});
c.on('dragStart' | 'dragMove' | 'dragEnd' | 'transitionEnd' | 'resize', cb);
```

**Nguyên tắc API:** options phẳng, tên gần owl/Swiper để dễ chuyển; mọi thứ optional với default hợp lý; trả về instance để chain.

---

## 8. Ngân sách hiệu năng & bundle (Budget)

| Phần | Mục tiêu (gzip) |
|---|---|
| Core JS | **< 8 KB** *(mục tiêu phấn đấu, KHÔNG bắt buộc — chốt: không chặn release nếu vượt)* |
| 1 effect trung bình | 0.3–1.5 KB |
| Core CSS | < 2 KB |
| "Hello world" (slide + nav + dots) | **< 10 KB** tổng |
| All effects (hiếm khi cần) | < 25 KB |

**Cách giữ nhẹ:**
- Tree-shaking (ESM, `sideEffects:false`), `/effects/<name>` import lẻ.
- CSS-mode cho ~30 hiệu ứng → ~0 JS.
- Không polyfill mặc định; tài liệu nêu rõ baseline.
- CI có **size-limit** *theo dõi & cảnh báo* (không chặn cứng — budget < 8KB là mục tiêu phấn đấu, không bắt buộc).

**Runtime performance:**
- `requestAnimationFrame` + chỉ `transform/opacity/clip-path`.
- `will-change` bật khi bắt đầu drag/transition, tắt khi xong.
- `ResizeObserver` thay resize event; cache đo đạc, đọc/ghi DOM tách batch (tránh layout thrash).
- `IntersectionObserver`: lazyload + pause autoplay khi offscreen.
- Passive pointer listeners.
- Virtualization cho > N slide.

---

## 9. Accessibility, i18n, RTL

- Vai trò ARIA: `role=region`/`aria-roledescription=carousel`, slide `aria-roledescription=slide`, `aria-label="x of y"`.
- Keyboard: ←/→ (hoặc ↑/↓ vertical), Home/End, Tab focus, Enter trên dots.
- `aria-live=polite` cho thông báo slide (tắt khi autoplay).
- **`prefers-reduced-motion`**: tự hạ về fade/cắt đơn giản hoặc không animation.
- Pause autoplay khi focus/hover.
- RTL: lật trục, mirror nav, clone đúng phía.
- i18n: `navText`, `aria-label` template tùy chỉnh.

---

## 10. Hỗ trợ trình duyệt & fallback

- Baseline: trình duyệt evergreen (Chrome/Edge/Firefox/Safari 2 năm gần nhất).
- No-JS / lỗi load: container fallback dạng `overflow:auto` + `scroll-snap` (vẫn xem được).
- Dùng CSS `@supports` cho `clip-path`, 3D transform; effect không hỗ trợ → fallback `fade`.

---

## 11. Wrapper Framework

- **React**: `<Carousel>` + `<Slide>`, hook `useCarousel`, controlled/uncontrolled.
- **Vue 3**: component + `v-model` cho index.
- **Svelte**: component + action `use:carousel`.
- **Web Component**: `<feather-scroll>` (dùng được ở mọi nơi, kể cả Angular).
- Mỗi wrapper là lớp mỏng quanh core; SSR-safe (khởi tạo trong `onMounted`/`useEffect`).

---

## 12. Tech stack & tooling

- **Ngôn ngữ**: TypeScript (strict).
- **Build**: `tsup`/`esbuild` (hoặc Rollup) → ESM + CJS + IIFE + `.d.ts`; minify terser.
- **Monorepo**: **pnpm workspaces** (đã chốt) — packages: `core`, `effects`, `plugins`, `adapters/*`, `docs`.
- **License**: **MIT** (đã chốt). **Publish npm công khai** (đã chốt) dưới scope/tên `feather-scroll`.
- **Lint/format**: ESLint + Prettier.
- **Test**: Vitest (unit) + Playwright (E2E + visual regression cho hiệu ứng).
- **Size**: `size-limit` trong CI.
- **CI**: GitHub Actions (lint, test, size, build, release).
- **Release**: Changesets + semantic versioning; publish npm.
- **Docs**: VitePress/Astro + gallery demo live (chọn effect từ dropdown, copy code).

---

## 13. Chiến lược test

1. **Unit**: state machine (index, loop wrap, clone), responsive resolver, pointer math.
2. **Integration (jsdom/Playwright)**: drag→change, autoplay timing, keyboard, a11y attrs.
3. **Visual regression**: snapshot từng effect ở vài mốc progress (Playwright) → chống hồi quy 105 hiệu ứng.
4. **Perf**: đo FPS khi drag bằng trace; size-limit chặn budget.
5. **A11y**: axe-core trong E2E.

---

## 14. Roadmap / Milestones

> Ước lượng cho 1 dev chính; chạy song song được thì rút ngắn.

**M0 — Khởi tạo (tuần 1)**
- Setup repo, TS, build, CI, size-limit, test harness, docs skeleton.

**M1 — Core MVP (tuần 2–3)**
- Stage/track, state, drag/swipe, nav, dots, autoplay, responsive, events, destroy.
- Effect engine + 2 effect: `slide`, `fade`. Native snap mode.
- ✅ Cột mốc: "carousel cơ bản nhẹ hơn owl, chạy được".

**M2 — Tính năng đầy owl (tuần 4–5)**
- loop/clone, center, stagePadding, margin, autoHeight, RTL, lazyLoad plugin, hash plugin, video plugin, merge.
- A11y đầy đủ + reduced-motion.

**M3 — Effect library đợt 1 (tuần 6–7)**
- Family A–E (Slide/Fade/Zoom/Flip/Cube) ≈ 46 effect + CSS-mode wipe (I).

**M4 — Effect library đợt 2 (tuần 8–9)**
- Family F–H, J–K (Coverflow/Cards/Parallax/Tiles/Creative) → đủ **105 effect**.
- Visual regression cho toàn bộ.

**M5 — Wrappers + Docs + Gallery (tuần 10–11)**
- React/Vue/Svelte/Web Component. Docs site + gallery live + migration guide từ owl.

**M6 — Hardening & 1.0 (tuần 12)**
- Perf pass, bundle pass, cross-browser, a11y audit, viết README/CHANGELOG, publish `1.0.0`.

---

## 15. Cấu trúc package & entry points (exports map)

```jsonc
// package.json (rút gọn)
{
  "name": "feather-scroll",
  "sideEffects": ["*.css"],
  "exports": {
    ".":            "./dist/core.js",
    "./effects":    "./dist/effects/index.js",
    "./effects/*":  "./dist/effects/*.js",
    "./plugins/*":  "./dist/plugins/*.js",
    "./styles/*":   "./dist/styles/*",
    "./react":      "./dist/adapters/react.js"
  }
}
```

---

## 16. Rủi ro & cách giảm thiểu

| Rủi ro | Giảm thiểu |
|---|---|
| 105 effect làm phình bundle | Tree-shaking + import lẻ + CSS-mode + size-limit CI |
| Hiệu ứng 3D giật trên máy yếu | GPU-only, `will-change` quản lý, fallback reduced-motion, giới hạn slide active |
| Maintain 105 effect tốn công | Engine chuẩn hóa + visual regression + nhiều effect chỉ là CSS class |
| Loop/clone gây lỗi index | State machine có test kỹ, dùng pattern Swiper "virtual loop" |
| Phạm vi quá lớn (1.0 **bắt buộc đủ 105 effect**) | Engine chuẩn hóa để effect mới rẻ + nhiều effect chỉ là CSS class; chia M3/M4 làm 2 đợt; tự động hóa visual regression. Có thể tăng song song (nhiều người làm effect) để kịp 1.0 |

---

## 17. Tiêu chí thành công (KPI)

- ✅ Bundle "slide + nav + dots" < 10KB gzip (so với owl ~43KB).
- ✅ ≥ 100 effect có tên, demo live trong gallery.
- ✅ 60 FPS khi drag trên thiết bị tầm trung.
- ✅ Lighthouse a11y 100 trên demo.
- ✅ Migration guide chuyển từ owl-carousel trong < 10 phút.

---

## 18. Quyết định đã chốt ✅

| # | Vấn đề | Quyết định |
|---|---|---|
| 1 | Tên thư viện | **FeatherScroll** (`feather-scroll`) |
| 2 | Ngôn ngữ/output | **TypeScript vanilla + wrapper framework** |
| 3 | Cấu trúc repo | **Monorepo (pnpm workspaces)** |
| 4 | Bundle < 8KB core | **Mục tiêu phấn đấu, KHÔNG bắt buộc** (không chặn release) |
| 5 | Phạm vi 1.0 | **1.0 phải đủ 105 effect** |
| 6 | License & phát hành | **MIT**, **publish npm công khai** |

---

## 19. Bước tiếp theo đề xuất

1. Bạn xác nhận/đổi các mục ở [phần 18](#18-câu-hỏi-mở--quyết-định-cần-chốt).
2. Mình khởi tạo **M0 + M1** (repo, build, core MVP với `slide`+`fade`) để có bản chạy được đầu tiên.
3. Lặp theo milestone.

---

## 20. M7 — Product Scroll Patterns (kế hoạch mở rộng) 🆕

> Bối cảnh: M0–M6 đã xong, nhưng **kho 105 effect đều là transition kiểu banner** (`layout: 'stack'`, slide phủ kín 100% viewport — cube/flip/fade/coverflow…). UX **kệ hàng sản phẩm** (product shelf) gần như chỉ có 1 kiểu (`slide` track + `responsive items` + `slideBy:'page'`). M7 bổ sung đúng mảng còn thiếu này.
>
> **Phạm vi đã chốt:** làm trọn **M7.1 → M7.3**. **Đóng gói:** package mới **`@feather-scroll/presets`** chứa các cấu hình product dùng-1-dòng (KHÔNG nhồi vào kho effect, vì product là *layout* chứ không phải *transition*).

### 20.1. Chẩn đoán hiện trạng (đã verify trong code)

| Tính năng product | Trạng thái thật |
|---|---|
| `dragFree` (kéo trớn momentum) | **Khai báo `types.ts`/`defaults.ts` nhưng no-op** — `Carousel.onEnd` luôn `Math.round()` → snap cứng |
| `autoWidth` / `items:'auto'` (card rộng theo nội dung) | **Không có** — `dom.sizeTrackSlides` ép mọi slide = `viewport/perView` |
| Grid / nhiều hàng mỗi trang | **Không có** — `dom.applyLayout` chỉ flex 1 hàng |
| Marquee chạy liên tục (constant px/s) | **Giả** — `marquee-ticker` chỉ là stack transition; autoplay là kiểu nhảy-bước |
| Mousewheel / trackpad ngang | Không có |
| Scrollbar kéo được | Không có (chỉ có recipe `progress`) |
| Virtualization (catalog cực dài) | Không có |
| Peek next, center, vertical, thumbnails sync, lazyload, slideBy page | ✅ Đã có |

### 20.2. Tham khảo mã nguồn mở (mapping thiết kế)

| Mẫu product scroll | Thư viện tham khảo | FeatherScroll cần |
|---|---|---|
| Free/momentum drag | Swiper `freeMode`, Embla `dragFree`, Flickity `freeScroll`, keen-slider | Cài thật `dragFree` + momentum decay |
| Card rộng tự do | Splide/owl `autoWidth`, Swiper `slidesPerView:'auto'` | `autoWidth` / `items:'auto'` |
| Lưới nhiều hàng | Swiper `grid.rows`, Splide `Grid` | Layout `grid` |
| Marquee/auto-scroll vô tận | Splide `AutoScroll`, Embla `AutoScroll` | Plugin `autoScroll` (px/s đều) |
| Nhóm ô / nhảy trang | Flickity `groupCells`, Swiper `slidesPerGroup` | ✅ `slideBy:'page'` |
| Lăn chuột | Swiper `mousewheel`, Embla `WheelGestures` | Plugin `mousewheel` |
| Thanh cuộn kéo | Swiper `scrollbar` | Plugin `scrollbar` |
| List khổng lồ | Swiper `virtual` | Plugin `virtual` |
| Gallery thumbnail sync | Swiper `thumbs` | ✅ plugin `thumbnails` |

### 20.3. Hạng mục bổ sung

**A. Core primitives (chạm engine — `packages/core`)**
1. **Free-mode / momentum** — cài đúng `dragFree`: `onEnd` không round, decay velocity trong `Animator`; `dragFree: true | 'snap'` (snap mềm về biên/slide gần nhất khi dừng). Quan trọng nhất.
2. **`autoWidth` / `items:'auto'`** — `sizeTrackSlides` đo width nội dung thật; `maxIndex`/snap/pageCount theo offset tích lũy từng slide.
3. **Layout `grid`** — option `grid:{ rows, fill:'row'|'column' }`, mở rộng `applyLayout` + `measure`.

**B. Plugins mới (opt-in, tree-shakeable — `packages/plugins`)**
4. `autoScroll` — marquee đều px/s, pause-on-hover, đảo chiều (logo/brand strip).
5. `mousewheel` — cuộn dọc → đi ngang; `forceToAxis`, `releaseOnEdges`.
6. `scrollbar` — thanh cuộn kéo được, đồng bộ `position`.
7. `virtual` — chỉ render slide quanh viewport cho catalog 1000+ sản phẩm.

**C. Package mới `@feather-scroll/presets`** (đã chốt — `packages/presets`)
Mỗi preset = 1 object option gọn (dùng `new Carousel(el, productShelf({...}))`):
`productShelf`, `peekShelf`, `freeShelf`, `gridShelf`, `logoMarquee`, `thumbGallery`, `dealCountdownRow`, `categoryPills`.
- Zero-dep, chỉ phụ thuộc kiểu `Options` của core; tự kéo plugin tương ứng (vd `logoMarquee` cần `autoScroll`).
- Vào exports map (mục 15): `"./presets": "./dist/presets/index.js"`.

**D. Examples + docs**
- Recipe mới `examples/recipes/`: `free-shelf.html`, `marquee-logos.html`, `grid-shelf.html`, `product-gallery.html`, `infinite-catalog.html`.
- Edge-fade mask (CSS thuần) trong `core.css` — gợi ý "kệ hàng còn nữa".
- `docs/` + gallery thêm filter **"Product patterns"**.

### 20.4. Roadmap M7 (làm trọn cả 3 đợt)

| Đợt | Nội dung | Ghi chú |
|---|---|---|
| **M7.1** | `dragFree` thật + `autoWidth` + edge-fade + recipe `free-shelf` & `marquee` | Giá trị cao nhất, đúng chỗ thiếu |
| **M7.2** | plugin `autoScroll` + `mousewheel` + `scrollbar` + scaffold package `presets` (productShelf/peekShelf/freeShelf/logoMarquee/thumbGallery) | UX desktop/marketing |
| **M7.3** | layout `grid` + plugin `virtual` + preset `gridShelf` + recipe catalog dài | Đụng layout/measure nhiều, làm sau |

Mỗi đợt giữ kỷ luật: `pnpm lint/typecheck/test/build/size` xanh + unit/visual test cho primitive mới; ngân sách: mỗi plugin 0.3–1KB gz, core tăng tối thiểu (free-mode trong core, phần còn lại opt-in).

### 20.5. Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| `dragFree` + `loop` (track-loop ringDelta) lệch index | Test kỹ state machine, snap-back về `[0,n)` như `to()` đang làm |
| `autoWidth`/`grid` đụng `measure`/`maxIndex`/`pageCount` | Refactor có test hồi quy; tách hàm đo riêng |
| Phình "hello world" | autoScroll/wheel/scrollbar/virtual + presets đều opt-in package riêng |
| Maintain thêm 1 package | presets chỉ là object cấu hình mỏng, không logic runtime nặng |

### 20.6. Quyết định đã chốt cho M7 ✅

| # | Vấn đề | Quyết định |
|---|---|---|
| 1 | Phạm vi | Làm trọn **M7.1 → M7.3** |
| 2 | Đóng gói product patterns | Package riêng **`@feather-scroll/presets`** |
| 3 | free-mode đặt ở đâu | Trong **core** (nhỏ); các tính năng nặng là plugin opt-in |

### 20.7. Thực thi — ĐÃ HOÀN THÀNH ✅ (M7.1 → M7.3)

**Core** (`packages/core`):
- `dragFree: true | 'snap'` momentum thật (`Animator.decay`, exp-decay) — chỉ track layout.
- `autoWidth` (offsets biến thiên trong `dom.measureAutoWidths` + `slide` effect) — track, non-loop.
- `grid: { rows }` (flex column-wrap, `dom.layoutGrid`) — track, non-loop, nhảy theo cột.
- API mới: `scrollTo` / `scrollBy` / `scrollToProgress`, getter `progress` / `itemSize` / `contentSize`, event `scroll`.
- CSS: `.fs--fade-edges` (mép mờ) + `.fs__scrollbar` trong `core.css`; class `fs--vertical`.

**Plugins** (`packages/plugins`, mỗi cái ≤0.7KB gz): `autoScroll` (marquee px/s), `mousewheel` (free/snap), `scrollbar` (kéo được), `virtual` (content windowing).

**Package mới** `@feather-scroll/presets` (605B gz): `productShelf`, `peekShelf`, `freeShelf`, `gridShelf`, `logoMarquee`, `dealRow`, `categoryPills`, `thumbGallery`.

**Recipes** (`examples/recipes/`): `free-shelf`, `marquee-logos`, `grid-shelf`, `product-gallery`, `infinite-catalog`.

**Docs**: `docs/product-scroll.md` (mới) + cập nhật `api.md` / `plugins.md` / `README`.

**Verify:** typecheck ✅ · lint ✅ · **42 test pass** (was 23) ✅ · build 7 package ✅ · size ✅ (core **7.89KB** < 8KB; plugins 0.4–0.7KB; presets 0.6KB).

**Giới hạn đã biết / việc tương lai:** `autoWidth` & `grid` chưa hỗ trợ `loop`; drag trong `autoWidth` dùng step trung bình (xấp xỉ, không 1:1 tuyệt đối với finger); `virtual` gỡ DOM con nên mất listener gắn trực tiếp (dùng event delegation). `marquee` dùng cell đều + loop (autoWidth không loop).