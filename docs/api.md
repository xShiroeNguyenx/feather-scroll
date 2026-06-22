# API tham chiếu

## `new Carousel(target, options?)`

- `target`: `string` (CSS selector) hoặc `HTMLElement`.
- `options`: xem bên dưới.

## Options

| Option | Type | Default | Mô tả |
|---|---|---|---|
| `effect` | `Effect \| string` | `slide` | Hiệu ứng layout |
| `items` | `number` | `1` | Số slide/view |
| `gap` | `number` | `0` | Khoảng cách (px) |
| `slideBy` | `number \| 'page'` | `1` | Số slide mỗi lần chuyển |
| `center` | `boolean` | `false` | Căn giữa slide active |
| `stagePadding` | `number` | `0` | Padding 2 đầu (peek) |
| `autoWidth` | `boolean` | `false` | Mỗi slide rộng theo nội dung (track, không loop) |
| `grid` | `{ rows, fill? } \| false` | `false` | Lưới nhiều hàng, nhảy theo cột (track, không loop) |
| `axis` | `'horizontal' \| 'vertical'` | `horizontal` | Trục cuộn |
| `loop` | `boolean` | `false` | Lặp vô hạn (ring, không clone) |
| `rewind` | `boolean` | `false` | Quay về đầu/cuối khi hết |
| `speed` | `number` | `400` | Thời lượng chuyển (ms) |
| `easing` | `EasingName \| fn` | `ease` | linear/ease/spring/bounce/elastic/back/… |
| `drag` | `boolean` | `true` | Kéo/swipe |
| `dragFree` | `boolean \| 'snap'` | `false` | Kéo trớn momentum (track); `'snap'` = trớn rồi dừng vào slide gần nhất |
| `startIndex` | `number` | `0` | Slide bắt đầu |
| `autoplay` | `number \| {delay,pauseOnHover,…} \| false` | `false` | Tự chạy |
| `nav` | `boolean` | `false` | Nút prev/next |
| `navText` | `[string,string]` | `['‹','›']` | HTML nút nav |
| `dots` | `boolean` | `false` | Chấm phân trang |
| `rtl` | `boolean` | `false` | Phải-sang-trái |
| `responsive` | `Record<number, Partial<...>>` | — | Breakpoint (key = min-width) |
| `a11y` | `boolean` | `true` | ARIA + keyboard |
| `reducedMotion` | `'respect' \| 'ignore'` | `respect` | Tôn trọng prefers-reduced-motion |
| `renderMode` | `'transform' \| 'native'` | `transform` | Native = CSS scroll-snap |
| `plugins` | `Plugin[]` | `[]` | lazyload/autoHeight/hash/… |
| `classes` | `Partial<ClassNames>` | — | Tuỳ biến class |

## Methods

| Method | Mô tả |
|---|---|
| `next()` / `prev()` | Chuyển tới/lui |
| `to(index, { animate? })` | Tới slide `index` |
| `scrollTo(position, animate?)` | Tới vị trí phân số (free scroll; wrap khi loop) |
| `scrollBy(delta, animate?)` | Dịch theo delta phân số (free scroll) |
| `scrollToProgress(p, animate?)` | Tới tỉ lệ tiến trình 0→1 |
| `play()` / `stop()` | Bật/tắt autoplay |
| `refresh()` | Đo lại + cập nhật (sau khi resize/thay đổi DOM) |
| `destroy()` | Huỷ, khôi phục DOM gốc |
| `on(event, fn)` | Đăng ký, trả về hàm `off` |
| `off(event, fn)` | Huỷ đăng ký |

## Properties (read-only)

`index`, `position`, `length`, `progress` (0→1), `itemSize` (px một bước = itemMain+gap), `contentSize` (px tổng nội dung), `slides`, `root`, `viewport`, `track`, `settings`.

## Events

`init`, `beforeChange`, `change`, `changed`, `dragStart`, `dragMove`, `dragEnd`, `transitionStart`, `transitionEnd`, `scroll` (mỗi frame khi position đổi — free scroll/momentum/tween), `resize`, `autoplayStart`, `autoplayStop`, `update`, `destroy`.

```ts
c.on('change', ({ index, previousIndex }) => { /* … */ });
```

## Effect interface

```ts
interface Effect {
  name: string;
  layout: 'track' | 'stack';
  perViewDefault?: number;
  setup?(ctx: EffectContext): void;
  render(ctx: EffectContext): void;   // gọi mỗi frame
  teardown?(ctx: EffectContext): void;
}
```
