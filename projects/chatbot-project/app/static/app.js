document.addEventListener("DOMContentLoaded", function () {
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const chatBox = document.getElementById("chat-box");

    chatForm.addEventListener("submit", async function (e) {
        e.preventDefault(); // 阻止表單默認提交行為

        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        // 在聊天框中顯示用戶輸入
        appendMessage("user", userMessage);

        // 向後端發送請求
        try {
            const response = await fetch("/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) {
                throw new Error("無法與伺服器通信！");
            }

            const data = await response.json();
            const aiMessage = data.response;

            // 在聊天框中顯示 AI 回應
            appendMessage("ai", aiMessage);
        } catch (error) {
            appendMessage("ai", "抱歉，我無法回應您的請求。");
            console.error("錯誤:", error);
        }

        // 清空輸入框
        chatInput.value = "";
    });

    // 用於在聊天框中添加訊息
    function appendMessage(sender, message) {
        const messageElement = document.createElement("div");
        messageElement.className = sender === "user" ? "message user" : "message ai";
        messageElement.textContent = message;
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight; // 滾動到最新消息
    }
});
