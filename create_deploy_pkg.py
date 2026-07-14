import tarfile
import base64
import os
import json

files_to_pack = [
    "dist/",
    "api/",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "vite.config.ts",
    "tailwind.config.js",
    "postcss.config.js",
    "index.html",
    "docker-compose.yml",
    "Dockerfile.frontend",
    "Dockerfile.backend",
    "nginx.conf",
    ".dockerignore",
]

output_tar = "/workspace/vaultkey-deploy.tar.gz"
with tarfile.open(output_tar, "w:gz") as tar:
    for f in files_to_pack:
        if os.path.exists(f):
            tar.add(f)

tar_size = os.path.getsize(output_tar)
print(f"Tar.gz size: {tar_size} bytes ({tar_size/1024/1024:.2f} MB)")

with open(output_tar, "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

print(f"Base64 size: {len(b64)} bytes ({len(b64)/1024:.0f} KB)")

chunk_size = 50000
chunks = [b64[i:i+chunk_size] for i in range(0, len(b64), chunk_size)]
print(f"Number of chunks: {len(chunks)}")

os.makedirs("/workspace/chunks", exist_ok=True)
for i, chunk in enumerate(chunks):
    with open(f"/workspace/chunks/chunk_{i:03d}", "w") as f:
        f.write(chunk)

print(f"Chunks saved to /workspace/chunks/")
print(f"Total chunks: {len(chunks)}")

# Save metadata
with open("/workspace/deploy_meta.json", "w") as f:
    json.dump({
        "total_chunks": len(chunks),
        "chunk_size": chunk_size,
        "tar_size": tar_size,
        "b64_size": len(b64)
    }, f)
