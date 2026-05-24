import "./globals.scss";

export const metadata = {
  title: "美股週報分析工作台",
  description: "依照自訂美股週報規則追蹤、整理與輸出分析"
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
