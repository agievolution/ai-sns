# ChromaDB 向量化功能配置指南

## 功能概述

已成功实现 ChromaDB + OpenAI Embedding 的向量化功能，支持：
- 文件上传自动向量化（支持 PDF, DOCX, PPTX, XLSX, TXT）
- 语义搜索
- 文件删除时自动清理向量数据

## 环境配置

### 1. 设置 OpenAI API Key

在启动后端服务前，需要设置 OpenAI API Key 环境变量：

```bash
export OPENAI_API_KEY="your-openai-api-key-here"
```

或者在 `.env` 文件中添加：
```
OPENAI_API_KEY=your-openai-api-key-here
```

### 2. 已安装的依赖包

以下包已自动安装：
- chromadb==1.4.1
- openai==2.15.0
- pypdf==6.6.0
- python-docx==1.2.0
- python-pptx==1.0.2
- openpyxl==3.1.5

## 功能说明

### 1. 文件上传与向量化

当用户上传文件到 kmtype=0 的知识库时：
1. 文件保存到 `km/{km_id}/doc/` 目录
2. 自动提取文本内容
3. 根据 `km_cfg` 表中的 `textblocklength` 和 `overlaplength` 参数进行文本分块
4. 使用 OpenAI `text-embedding-3-small` 模型生成向量
5. 存储到 ChromaDB（位于 `km/chroma_db/` 目录）

### 2. 向量搜索

前端调用 `/api/km/{kb_id}/search` 接口：
- 输入：查询文本和返回结果数量（top_k）
- 处理：将查询文本转换为向量，在 ChromaDB 中搜索相似文档
- 输出：返回最相关的文档片段及相似度分数

### 3. 文件删除

删除文件时会自动：
1. 从数据库标记为删除
2. 从 ChromaDB 中删除所有相关向量

## 数据库修改

### key_value 表

已添加 `km_id` 字段：
```sql
ALTER TABLE key_value ADD COLUMN km_id VARCHAR(100);
```

## 文件结构

```
backend/modules/km/
├── service.py              # 主服务层（已更新）
├── vector_service.py       # 向量化服务（新增）
├── document_loader.py      # 文档加载器（新增）
├── router.py              # API 路由
└── ...

km/
├── chroma_db/             # ChromaDB 数据存储目录
└── {km_id}/
    └── doc/               # 上传的文件
```

## API 端点

### 上传文件
```
POST /api/km/{kb_id}/files
Content-Type: multipart/form-data

file: <文件>
```

### 向量搜索
```
POST /api/km/{kb_id}/search
Content-Type: application/json

{
  "query": "搜索查询",
  "top_k": 5
}
```

### 删除文件
```
DELETE /api/km/{kb_id}/files/{file_id}
```

## 使用示例

### 1. 上传文件并自动向量化

```python
import requests

# 上传文件
with open('document.pdf', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:8788/api/km/1/files', files=files)
    print(response.json())
```

### 2. 执行向量搜索

```python
import requests

# 搜索
data = {
    "query": "什么是人工智能？",
    "top_k": 5
}
response = requests.post('http://localhost:8788/api/km/1/search', json=data)
results = response.json()

for result in results['data']:
    print(f"Score: {result['score']:.3f}")
    print(f"Content: {result['content'][:200]}...")
    print(f"Source: {result['metadata']['filename']}")
    print("---")
```

## 注意事项

1. **OpenAI API Key**: 必须设置有效的 OpenAI API Key，否则向量化会失败
2. **费用**: 使用 OpenAI Embedding API 会产生费用（text-embedding-3-small 模型相对便宜）
3. **文件大小**: 大文件会被分块处理，分块大小由 `km_cfg.textblocklength` 控制
4. **存储空间**: ChromaDB 会占用磁盘空间，建议定期清理不需要的知识库

## 故障排查

### 问题：向量化失败
- 检查 OpenAI API Key 是否正确设置
- 检查网络连接是否正常
- 查看后端日志获取详细错误信息

### 问题：搜索无结果
- 确认文件已成功上传并向量化
- 检查 ChromaDB 目录是否存在数据
- 尝试使用更通用的查询词

### 问题：文件解析失败
- 确认文件格式是否支持（PDF, DOCX, PPTX, XLSX, TXT）
- 检查文件是否损坏
- 查看后端日志获取详细错误信息
