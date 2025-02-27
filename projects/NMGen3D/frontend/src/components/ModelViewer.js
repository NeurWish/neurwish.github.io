import { useGLTF } from "@react-three/drei";

function ModelViewer({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default ModelViewer;
