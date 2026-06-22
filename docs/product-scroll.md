# Product scroll (kệ sản phẩm) — M7

Ngoài 105 hiệu ứng **banner** (transition 1-ảnh), FeatherScroll có bộ tính năng cho **kệ sản phẩm** kiểu e-commerce: kéo trớn, lưới nhiều hàng, marquee, gallery, catalog dài. Tất cả nằm trong **core options + plugins**, đóng gói sẵn ở package **`@feather-scroll/presets`**.

## Tính năng core

### Free-scroll / momentum — `dragFree`

```ts
new Carousel('#shelf', { items: 4, gap: 16, drag: true, dragFree: true });
// 'snap' = trớn theo quán tính rồi dừng đúng vào slide gần nhất
new Carousel('#shelf', { items: 4, dragFree: 'snap' });
```
Chỉ áp dụng cho layout `track` (kệ nhiều item). Banner (`stack`) vẫn snap cứng.

### autoWidth — card rộng theo nội dung

```ts
new Carousel('#pills', { autoWidth: true, gap: 10, dragFree: true });
```
Mỗi slide giữ bề rộng nội dung (như owl/Splide `autoWidth`). Hỗ trợ track, không loop.

### grid — lưới nhiều hàng

```ts
new Carousel('#grid', { items: 4, gap: 16, grid: { rows: 2 }, slideBy: 'page' });
```
Slides xếp thành cột `rows` ô, nhảy ngang theo từng cột. Track, không loop, một transform GPU.

### API free-scroll

```ts
c.scrollTo(2.5);          // tới vị trí phân số
c.scrollBy(0.5);          // dịch tương đối
c.scrollToProgress(0.8);  // theo tỉ lệ 0→1
c.progress;               // 0→1 (read-only)
c.itemSize; c.contentSize;
c.on('scroll', ({ position, progress }) => { /* mỗi frame */ });
```

### Edge fade (mép mờ)

Thêm class `fs--fade-edges` lên root để mờ hai mép — gợi ý “còn hàng để cuộn”.

## Plugins product

`autoScroll` (marquee), `mousewheel`, `scrollbar`, `virtual` — xem [plugins.md](./plugins.md).

## Presets — `@feather-scroll/presets`

Cấu hình sẵn, dùng một dòng; mọi tham số đều ghi đè được:

```ts
import Carousel from '@feather-scroll/core';
import { productShelf, freeShelf, gridShelf, logoMarquee, peekShelf,
         dealRow, categoryPills, thumbGallery } from '@feather-scroll/presets';

new Carousel('#a', productShelf());              // kệ nhảy theo trang + nav
new Carousel('#b', freeShelf({ gap: 16 }));      // kéo trớn momentum
new Carousel('#c', gridShelf({ rows: 2 }));      // lưới 2 hàng
new Carousel('#d', logoMarquee({ speed: 50 }));  // marquee logo (tự kèm autoScroll)
new Carousel('#e', peekShelf());                 // hé card kế bên
new Carousel('#f', dealRow());                   // flash deal autoplay
new Carousel('#g', categoryPills());             // chip autoWidth free-scroll
```

| Preset | Dùng cho | Điểm chính |
|---|---|---|
| `productShelf` | Hàng sản phẩm cơ bản | `slideBy:'page'`, nav, responsive 1→4 |
| `peekShelf` | Hé item kế | `stagePadding`, advance 1 |
| `freeShelf` | “You may also like” | `dragFree`, responsive 2→5 |
| `gridShelf` | Khối nhiều hàng | `grid.rows`, `slideBy:'page'` |
| `logoMarquee` | Dải logo/brand | `loop` + `autoScroll`, hai chiều |
| `dealRow` | Deal of the day | `loop` + autoplay + dots |
| `categoryPills` | Chip/filter | `autoWidth` + `dragFree` |
| `thumbGallery` | Trang chi tiết | trả `{ main, thumbs }` để nối `thumbnails` |

`thumbGallery` trả cặp option, nối bằng plugin `thumbnails`:

```ts
import { thumbnails } from '@feather-scroll/plugins';
const { main, thumbs } = thumbGallery();
const strip = new Carousel('#thumbs', thumbs);
new Carousel('#main', { ...main, plugins: [thumbnails({ thumbs: strip })] });
```

## Recipe chạy thật

`examples/recipes/`: `free-shelf`, `marquee-logos`, `grid-shelf`, `product-gallery`, `infinite-catalog`.
