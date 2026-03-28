module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

  try {
    let rawKey = process.env.GEMINI_API_KEY || "";
    const GEMINI_API_KEY = rawKey.trim().replace(/^["']|["']$/g, '');
    
    // 🟢 使用 1.5 Flash，這是在綁卡後最穩定且便宜的模型
    const GEMINI_MODEL = "gemini-1.5-flash";
    
    // 🟢 使用 v1beta，因為它目前對 1.5 Flash 的支援度最廣
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    if (!GEMINI_API_KEY) return res.status(500).json({ error: "API Key Missing." });

    const { promptText, mimeType, imageBase64 } = req.body || {};
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }, { inlineData: { mimeType, data: imageBase64 } }] }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Google API Error",
        details: data?.error || data
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
