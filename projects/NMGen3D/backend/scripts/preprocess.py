import trimesh

def optimize_mesh(input_mesh_path, output_mesh_path):
    """簡化與優化 3D 模型"""
    mesh = trimesh.load_mesh(input_mesh_path)  # 載入 3D 模型

    # 簡化模型（減少多邊形數量）
    mesh = mesh.simplify_quadratic_decimation(10000)  # 保留 10000 面

    # 儲存優化後的模型
    mesh.export(output_mesh_path)

    return output_mesh_path  # 回傳優化後的檔案路徑
