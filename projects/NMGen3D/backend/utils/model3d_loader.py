import trimesh
# import pyrender
import open3d as o3d
import torch
import torch.nn as nn
# import torch3d

# 使用 trimesh 載入模型
def load_model_trimesh(filepath):
    return trimesh.load_mesh(filepath)

# # 使用 pyrender 載入模型
# def load_model_pyrender(filepath):
#     mesh = trimesh.load_mesh(filepath)
#     return pyrender.Mesh.from_trimesh(mesh)

# 使用 open3d 載入模型
def load_model_open3d(filepath):
    return o3d.io.read_triangle_mesh(filepath)

# # 使用 torch3d 載入模型
# def load_model_torch3d(filepath):
#     verts, faces = torch3d.io.load_obj(filepath)
#     return verts, faces

# 使用 trimesh 生成網格
def generate_mesh_trimesh(vertices, faces):
    return trimesh.Trimesh(vertices=vertices, faces=faces)

# # 使用 pyrender 生成網格
# def generate_mesh_pyrender(vertices, faces):
#     trimesh_mesh = trimesh.Trimesh(vertices=vertices, faces=faces)
#     return pyrender.Mesh.from_trimesh(trimesh_mesh)

# 使用 open3d 生成網格
def generate_mesh_open3d(vertices, faces):
    mesh = o3d.geometry.TriangleMesh()
    mesh.vertices = o3d.utility.Vector3dVector(vertices)
    mesh.triangles = o3d.utility.Vector3iVector(faces)
    return mesh

# 使用 torch3d 生成網格
def generate_mesh_torch3d(vertices, faces):
    verts_tensor = torch.tensor(vertices, dtype=torch.float32)
    faces_tensor = torch.tensor(faces, dtype=torch.int64)
    return verts_tensor, faces_tensor
