module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

  try {
    // 1. 改抓 OpenAI 的 API Key
    let rawKey = process.env.OPENAI_API_KEY || "";
    const OPENAI_API_KEY = rawKey.trim().replace(/^["']|["']$/g, '');

    if (!OPENAI_API_KEY) return res.status(500).json({ error: "請在 Vercel 設定 OPENAI_API_KEY" });

    const { promptText, mimeType, imageBase64 } = req.body || {};
    if (!promptText || !mimeType || !imageBase64) return res.status(400).json({ error: "未接收到照片。" });

    // 2. 呼叫 OpenAI 的 GPT-4o-mini 視覺模型
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // 速度極快、價格便宜、支援視覺的完美模型
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: promptText },
              { 
                type: "image_url", 
                image_url: { url: `data:${mimeType};base64,${imageBase64}` } 
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    const data = await response.json();
    
    // 錯誤處理：把 OpenAI 的報錯直接丟出去
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI API 請求失敗",
        details: data?.error || data
      });
    }

    // 3. 終極魔法：將 OpenAI 的答案「偽裝」成 Gemini 的格式！
    // 這樣前端 index.html 完全不用改，照樣能印出文字
    const replyText = data.choices[0].message.content;

    return res.status(200).json({
      candidates: [
        {
          content: {
            parts: [{ text: replyText }]
          }
        }
      ]
    });

  } catch (error) {
    return res.status(500).json({ error: error.message || "伺服器未知錯誤" });
  }
};
