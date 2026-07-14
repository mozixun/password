import paramiko
import os

HOST = "124.222.162.174"
USER = "shaoye"
PASSWORD = "520SHENxin"
PROJECT_DIR = "/opt/vaultkey"

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {HOST}...")
    ssh.connect(HOST, username=USER, password=PASSWORD)
    
    print("Creating project directory...")
    stdin, stdout, stderr = ssh.exec_command(f"mkdir -p {PROJECT_DIR}")
    stdout.channel.recv_exit_status()
    
    sftp = ssh.open_sftp()
    
    files_to_upload = [
        "docker-compose.yml",
        "Dockerfile.frontend",
        "Dockerfile.backend",
        "nginx.conf",
        ".dockerignore",
        "package.json",
        "package-lock.json",
        "tsconfig.json",
        "vite.config.ts",
        "tailwind.config.js",
        "postcss.config.js",
        "index.html",
    ]
    
    for filepath in files_to_upload:
        if os.path.exists(filepath):
            remote_path = os.path.join(PROJECT_DIR, filepath)
            print(f"Uploading {filepath}...")
            sftp.put(filepath, remote_path)
        else:
            print(f"Warning: {filepath} not found, skipping")
    
    dirs_to_upload = ["api", "src", "public"]
    
    def upload_dir(local_dir, remote_dir):
        for item in os.listdir(local_dir):
            local_path = os.path.join(local_dir, item)
            remote_path = os.path.join(remote_dir, item)
            if os.path.isdir(local_path):
                print(f"Creating directory {remote_path}")
                stdin, stdout, stderr = ssh.exec_command(f"mkdir -p {remote_path}")
                stdout.channel.recv_exit_status()
                upload_dir(local_path, remote_path)
            else:
                print(f"Uploading {local_path}")
                sftp.put(local_path, remote_path)
    
    for dirname in dirs_to_upload:
        if os.path.exists(dirname):
            remote_dir = os.path.join(PROJECT_DIR, dirname)
            upload_dir(dirname, remote_dir)
    
    sftp.close()
    
    print("Building and starting Docker containers...")
    stdin, stdout, stderr = ssh.exec_command(f"cd {PROJECT_DIR} && docker-compose up -d --build")
    exit_status = stdout.channel.recv_exit_status()
    output = stdout.read().decode()
    error = stderr.read().decode()
    
    if exit_status == 0:
        print("Deployment successful!")
        print(output)
    else:
        print(f"Deployment failed with exit code {exit_status}")
        print("Output:", output)
        print("Error:", error)
    
    print("Checking container status...")
    stdin, stdout, stderr = ssh.exec_command(f"cd {PROJECT_DIR} && docker-compose ps")
    print(stdout.read().decode())
    
finally:
    ssh.close()
