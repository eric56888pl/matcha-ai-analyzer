module.exports = async (req, res) => {
  // 處理跨域問題 (CORS)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    // 🚨 防呆裝甲啟動：自動清除 Vercel 環境變數中不小心混入的空白鍵或雙引號！
    let rawKey = process.env.GEMINI_API_KEY || "";
    const GEMINI_API_KEY = rawKey.trim().replace(/^["']|["']$/g, '');
    
    let rawModel = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const GEMINI_MODEL = rawModel.trim().replace(/^["']|["']$/g, '');

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "伺服器缺少 API Key，請檢查 Vercel 後台設定。" });
    }

    const { promptText, mimeType, imageBase64 } = req.body || {};
    if (!promptText || !mimeType || !imageBase64) {
      return res.status(400).json({ error: "請求資料不完整，請確認上傳了照片。" });
    }

    const requestBody = {
      contents: [
        {
          parts: [
            { text: promptText },
            { inlineData: { mimeType, data: imageBase64 } }
          ]
        }
      ]
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    // 如果 Google API 回傳錯誤
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Gemini 請求失敗",
        details: data?.error || data
      });
    }

    // 成功回傳結果給前端
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || "伺服器發生未知錯誤" });
  }
};