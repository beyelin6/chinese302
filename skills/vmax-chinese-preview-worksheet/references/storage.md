# Google Drive 儲存規則

## 目前專案位置

- V-MAX 教材庫：`1d1vCEw-BzFiR_DyGYDM1f3aovrKODIaA`
- 四上康軒國語：`1Boc3-9FxVUI6NF9iJS8uGwNeVag8uYml`
- 第一至六課預習單規劃：`1fVmP4lCodFA8kcAW33_UykcZyKcaT0wN`

目標資料夾網址：
`https://drive.google.com/drive/folders/1fVmP4lCodFA8kcAW33_UykcZyKcaT0wN`

## 上傳流程

1. 使用 Google Drive 技能讀取目標資料夾。
2. 先搜尋或列出同名檔，不預測檔案 ID。
3. 同一版本的同名正式檔存在時使用原 ID 更新檔案內容與名稱。
4. 同名檔不存在時才上傳新檔。
5. 更新後重新列出資料夾，核對回傳結果。

## 雙版本檔名與取代規則

- A｜清楚框線版 PNG：`四上國語_第N課_課名_預習單.png`
- B｜自由手繪版 PNG：`四上國語_第N課_課名_預習單_自由手繪版.png`
- A 版合併 PDF：`四上國語_第一至六課_課前預習單.pdf`
- B 版合併 PDF：`四上國語_第一至六課_課前預習單_自由手繪版.pdf`

取代判斷同時比對「版本模式＋完整檔名」：

1. A 版更新只能取代 A 版同名檔。
2. B 版更新只能取代 B 版同名檔。
3. A、B 版即使課次與內容相同，也必須是兩個獨立檔案與兩個獨立連結。
4. 合併 PDF 亦採相同規則，不得用另一版本 PDF 的檔案 ID 更新。
5. 上傳前若發現檔名與模式不一致，停止並修正檔名，不猜測使用者要覆蓋哪一版。

## 目前正式檔

- 第一課正式預習單檔案 ID：`1WlQaYdPBOmeJVyQvglC8O-rJ9azT23Ix`
- 預習單內容確認主檔 ID：`1C14XVJv9juWIgIs1kfUKL7tQwv3oGLSI`

對第二課以後不可假設舊 ID；每次讀取資料夾取得實際 ID。
