// 檔案路徑: src/utils.ts
// 這是我們自己手刻的 IndexedDB 封裝與工具函數庫

import * as pdfjsLib from 'pdfjs-dist';
// 設定 worker，這行非常重要，直接使用 CDN 避免 Vite 打包問題
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const DB_NAME = 'VMaxStorage';
const STORE_NAME = 'stateStore';

const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
        }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveToDB = async (key: string, value: any): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const loadFromDB = async (key: string): Promise<any> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// ==========================================
// 📥 多模態下載功能區塊 (Download Modes)
// ==========================================

export const downloadProjectJson = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 🌟 [匯出模式：Word] 透過 HTML 欺騙 MS Word 的經典輕量級手法
export const downloadAsWord = (htmlContent: string, filename: string) => {
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${filename}</title>
      <style>
        body { font-family: "Microsoft JhengHei", Arial, sans-serif; line-height: 1.6; color: #333; }
        h1, h2, h3 { color: #0f172a; margin-top: 1.5em; margin-bottom: 0.5em; }
        code { background-color: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: monospace; }
        pre { background-color: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; white-space: pre-wrap; word-wrap: break-word; }
        blockquote { border-left: 4px solid #cbd5e1; padding-left: 10px; color: #64748b; margin-left: 0; }
        ul, ol { margin-bottom: 1em; }
        li { margin-bottom: 0.5em; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
      </style>
    </head>
    <body>
  `;
  const footer = "</body></html>";
  const sourceHTML = header + htmlContent + footer;
  
  // 建立 Blob 與連結
  const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const fileDownload = document.createElement("a");
  document.body.appendChild(fileDownload);
  fileDownload.href = url;
  fileDownload.download = `${filename}.doc`;
  fileDownload.click();
  document.body.removeChild(fileDownload);
  URL.revokeObjectURL(url);
};

// 🌟 [匯出模式：Markdown] 適合需要原始排版或轉移至 Notion 等工具的使用者
export const downloadAsMarkdown = (content: string, filename: string) => {
  const blob = new Blob(['\ufeff', content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 🌟 [匯出模式：純文字] 最基礎無格式的輸出，適合極簡需求
export const downloadAsText = (content: string, filename: string) => {
  const blob = new Blob(['\ufeff', content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ==========================================
// 📄 PDF 工具區塊
// ==========================================

export const extractTextFromPDFBase64 = async (base64Data: string): Promise<string> => {
  try {
    // 1. 將 Base64 轉換為二進位陣列
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 2. 載入 PDF
    const loadingTask = pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;
    let fullText = '';

    // 3. 逐頁抽出文字
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        // @ts-ignore
        .map((item) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText;
  } catch (error) {
    console.error("PDF 解析失敗:", error);
    throw new Error("無法從此 PDF 中提取文字。");
  }
};