# MURDONOKU – GitHub Pages SVG Solution Viewer

Bộ website tĩnh dành cho **Murdonoku**, giữ nguyên phương thức xem đáp án từ dự án Murdograms cũ và hoạt động trên GitHub Pages **không cần backend, database hoặc cài package**.

## 1. Cấu trúc thư mục

```text
MURDONOKU_GitHub_Pages/
├── .nojekyll
├── index.html                 # Trang chủ + form nhập tên SVG
├── viewer.html                # Trang mở bằng QR
├── assets/
│   ├── config.js              # TỌA ĐỘ các vùng Sudoku, Nonogram, Hung thủ
│   ├── style.css              # Giao diện desktop + mobile
│   └── viewer.js              # Tải SVG, fit screen, fullscreen, phím tắt
├── solutions/
│   ├── EXAMPLE_full_solution.svg  # File ví dụ: được phép xóa sau khi thử
│   └── .gitkeep
├── make_links.py              # Tùy chọn: tạo CSV chứa link để làm QR
├── robots.txt                 # Yêu cầu robot tìm kiếm không lập chỉ mục
└── README.md
```

**Quan trọng:** Đưa NỘI DUNG bên trong thư mục này vào **thư mục gốc (root) của repo GitHub**, không upload một tầng thư mục lồng bên ngoài. Nếu vẫn dùng repo Murdograms cũ thì cập nhật file ở root của repo đang chạy Pages. Tên thư mục giải nén `Murdograms-main` không nhất thiết là tên repo trên GitHub.

## 2. Upload lên GitHub

1. Tạo repo mới, ví dụ `MURDONOKU`, hoặc tiếp tục sử dụng **repo GitHub cũ đang phát hành Murdograms**. Nếu đổi tên repo, địa chỉ website/QR cũng có thể thay đổi.
2. Trong GitHub, chọn **Add file → Upload files**, đưa các file `index.html`, `viewer.html`, `robots.txt`, `.nojekyll`, `make_links.py`, `README.md` và 2 thư mục `assets`, `solutions` vào đúng cấu trúc. Upload từ máy bằng Git dễ giữ nguyên thư mục hơn.
3. Mở **Settings → Pages → Build and deployment**, chọn **Deploy from a branch**, nhánh `main`, thư mục `/ (root)`, rồi **Save**. Nếu trang Pages đã bật thì không cần tạo lại.
4. Đợi GitHub Pages triển khai xong; mở `https://YOURNAME.github.io/MURDONOKU/viewer.html?f=EXAMPLE_full_solution.svg` để thử.
5. Sau đó, bạn chỉ việc upload các file SVG mới vào `solutions/`. **Không cần sửa HTML, JS hoặc cập nhật danh sách file** nếu liên kết QR truyền đúng tên SVG.

Giữ đúng chữ hoa, chữ thường và phần `.svg` khi đặt tên file. Dấu cách/ký tự Unicode trong tên sẽ tự được encode khi tạo link bằng Python.

## 3. Đường dẫn QR – tương thích phiên bản cũ

Giả sử tên repo là `MURDONOKU`, tên file là `CASE_001_full_solution.svg`:

```text
https://YOURNAME.github.io/MURDONOKU/viewer.html?f=CASE_001_full_solution.svg
```

File mẫu có thể thử ngay:

```text
https://YOURNAME.github.io/MURDONOKU/viewer.html?f=EXAMPLE_full_solution.svg
```

- `?f=...` là tham số đã dùng ở `Murdograms-main/viewer.html` cũ và **được giữ nguyên**.
- `?file=...` cũng được hỗ trợ.
- Không thêm `solutions/` vào sau `?f=` nếu SVG nằm trực tiếp trong thư mục `solutions`.
- Có thể chia thư mục con: `?f=Volume1%2FCASE_001.svg` tương ứng `solutions/Volume1/CASE_001.svg`.
- Nếu tên không có `.svg`, chương trình sẽ tự thêm `.svg`.

### Tạo hàng loạt URL cho 80, 100 hay 1000 file SVG

Máy đã có Python 3 thì chạy lệnh sau sau khi upload/copy tất cả SVG vào `solutions/`:

```bash
python make_links.py --base https://YOURNAME.github.io/MURDONOKU
```

File `solution_links.csv` được tạo ngay tại root; mở bằng Excel để lấy cột `ViewerURL` đưa vào chương trình tạo QR. Không cần chạy script này để trang viewer hoạt động.

## 4. Hiển thị desktop và điện thoại

| Thiết bị | Chế độ | Kết quả |
|---|---|---|
| Máy tính | Toàn bộ | Fit nguyên SVG 16:9 vào vùng hiển thị; không cuộn/cắt |
| Điện thoại ngang | Toàn bộ | Fit nguyên ảnh đáp án, không cuộn |
| Điện thoại dọc | Toàn bộ | Fit nguyên ảnh vào bề ngang; không cuộn (chữ có thể nhỏ) |
| Điện thoại dọc | Sudoku/Nonogram/Hung thủ | Phóng lớn **từng khu vực** từ SVG gốc để dễ xem, không cuộn |
| Mọi thiết bị | Toàn màn hình | Mở Fullscreen API hoặc chế độ immersive dự phòng |

**Giới hạn vật lý:** SVG 1600×900 nằm ngang không thể cùng lúc **đủ lớn để đọc** và **hiển thị toàn bộ** trên màn hình điện thoại dọc. Vì thế người đọc có thể chuyển qua các tab để xem từng phần rõ nét. Không ảnh nào bị cắt trong chế độ **Toàn bộ**.

### Điều chỉnh vùng ảnh nếu thiết kế SVG tương lai khác bố cục

Sửa `assets/config.js`: ba vùng `sudoku`, `nonogram`, `murderer`. Tọa độ hiện tại khớp mẫu `EXAMPLE_full_solution.svg` 1600×900 mà bạn cung cấp. Nếu hình SVG vẫn đúng bố cục nhưng có độ phân giải khác (ví dụ 1920×1080), tọa độ **tự scale theo kích thước**.

Mỗi vùng là `{ x, y, w, h }` tính bằng pixel theo khung tham chiếu 1600×900. Chế độ **Toàn bộ** luôn hoạt động ngay cả nếu bố cục từng ảnh khác nhau.

## 5. Hạn chế sao chép – nói rõ giới hạn

Các biện pháp phía giao diện gồm:
- Nhấn **F12**, **Ctrl+Shift+I/J/C/K**, **Ctrl+U**, **Ctrl+S** trong trang sẽ hiển thị cảnh báo về bản quyền (nếu trình duyệt cho JavaScript chặn phím).
- Chuột phải trên vùng ảnh hiển thị cảnh báo; tắt thao tác kéo ảnh trực tiếp.
- Dùng **meta robots** trong trang để yêu cầu công cụ tìm kiếm không lập chỉ mục; `robots.txt` chỉ có hiệu lực chuẩn khi được phục vụ tại **gốc tên miền** (không phải thư mục con của GitHub Project Pages).

**Đây là rào cản đối với người dùng phổ thông, KHÔNG phải lớp bảo mật thực sự.** Bất cứ SVG nào đặt trong repo GitHub public hoặc GitHub Pages đều có thể truy cập/download bằng URL trực tiếp và DevTools vẫn có thể mở bằng menu/trình duyệt khác. JavaScript không ngăn được truy cập mạng hay xem repo công khai. Nếu muốn quyền truy cập thật sự, hãy dùng nền tảng có **xác thực máy chủ + quyền truy cập tệp riêng tư hoặc URL ký có thời hạn**, thay vì GitHub Pages tĩnh.

Có thể bật/tắt cảnh báo tại `assets/config.js`:

```js
  discourageInspection: true
```

## 6. Kiểm tra lỗi nhanh

- **404 Not Found:** tên repo/user sai, GitHub Pages chưa build xong, thiếu SVG trong `solutions`, hoặc sai phân biệt hoa/thường.
- **Chỉ thấy trang chủ:** link QR thiếu `?f=TÊN_FILE.svg`.
- **Trắng ảnh:** file SVG có lỗi, tên SVG sai hoặc chưa upload. Kiểm tra bằng cách mở trực tiếp `.../solutions/FILE.svg`.
- **Điện thoại đọc chữ quá nhỏ:** chọn tab Sudoku/Nonogram/Hung thủ để xem lớn hơn hoặc xoay ngang điện thoại.
- **Tab xem một phần không đúng vị trí:** chỉnh tọa độ vùng trong `assets/config.js` cho khớp template SVG thực tế.

Không cần `.htaccess`, PHP, Node.js, npm, API key hay kho lưu trữ ngoài.
