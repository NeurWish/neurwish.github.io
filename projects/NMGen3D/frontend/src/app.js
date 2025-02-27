import { useState } from "react";
import axios from "axios";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import ModelViewer from "./components/ModelViewer";

function App() {
  const [file, setFile] = useState(null);
  const [modelUrl, setModelUrl] = useState("");
  const [error, setError] = useState("");

  const uploadAndGenerate = async () => {
    if (!file) {
      setError("請選擇一張圖片");
      return;
    }
    setError("");

    const formData = new FormData();
    formData.append("image", file);

    console.log("🚀 FormData 準備傳輸:", formData.get("image")); // 確認前端有正確傳遞檔案

    try {
      const response = await axios.post("http://127.0.0.1:8000/generate_3d/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("✅ API 回應:", response.data);
      setModelUrl(response.data.model_path);
    } catch (err) {
      console.error("❌ API 錯誤:", err.response);
      setError(err.response?.data?.error || "無法連接到伺服器");
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={uploadAndGenerate}>生成 3D</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {modelUrl && (
        <Canvas>
          <OrbitControls />
          <ModelViewer url={modelUrl} />
        </Canvas>
      )}
    </div>
  );
}

export default App;
