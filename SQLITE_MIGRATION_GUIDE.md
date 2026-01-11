# SQLite数据库迁移指南

## 概述

笔记存储已从JSON文件改为SQLite数据库，使用 `db/db.sqlite` 文件存储。

## 数据库表结构

使用的表：`note_mng`

新增字段：
- `tags` (TEXT) - 标签列表（JSON格式）
- `is_pinned` (BOOLEAN) - 是否置顶
- `updated_at` (DATETIME) - 更新时间

## 迁移步骤

### 方案1：自动迁移（推荐）

如果你有现有的JSON笔记数据需要迁移：

```bash
# 1. 升级数据库表结构（添加新字段）
python3 upgrade_database.py

# 2. 迁移JSON数据到SQLite
python3 migrate_notes_to_sqlite.py
```

### 方案2：全新安装

如果是全新安装，无需迁移：

```bash
# 只需升级数据库表结构
python3 upgrade_database.py
```

数据库表会在首次运行应用时自动创建。

## 迁移后的变化

### ✅ 优势

1. **更好的性能**：SQLite比JSON文件读写更快
2. **数据完整性**：事务支持，确保数据不丢失
3. **并发支持**：多进程访问时更安全
4. **复杂查询**：支持按标签、时间等多维度查询
5. **软删除**：删除的笔记可以恢复

### 📦 数据存储

- **位置**：`db/db.sqlite`
- **表名**：`note_mng`
- **备份**：原JSON文件会自动备份为 `notes_backup_YYYYMMDD_HHMMSS.json`

### 🔧 API保持不变

前端无需任何修改，所有API接口保持完全一致：
- `GET /api/km/notes` - 获取所有笔记
- `POST /api/km/notes` - 创建笔记
- `PUT /api/km/notes/{id}` - 更新笔记
- `DELETE /api/km/notes/{id}` - 删除笔记
- `POST /api/km/notes/{id}/toggle-pin` - 切换置顶

## 验证迁移

迁移完成后，可以：

1. 启动应用
2. 检查笔记是否都在
3. 测试创建、编辑、删除功能
4. 验证标签和置顶功能

## 回滚方案

如果需要回滚到JSON存储：

1. 停止应用
2. 恢复备份的JSON文件：
   ```bash
   cp km/notes/notes_backup_*.json km/notes/notes.json
   ```
3. 切换回旧版本的 `note_service.py`

## 技术细节

### 字段映射

| JSON字段 | 数据库字段 | 类型 |
|---------|----------|------|
| id | id | INTEGER (主键) |
| title | title | VARCHAR(100) |
| content | content | TEXT |
| tags | tags | TEXT (JSON) |
| is_pinned | is_pinned | BOOLEAN |
| created_at | create_time | DATETIME |
| updated_at | updated_at | DATETIME |

### 软删除

笔记删除使用软删除机制：
- `is_delete=False` - 正常笔记
- `is_delete=True` - 已删除笔记

已删除的笔记不会在API中返回，但仍保留在数据库中。

## 常见问题

**Q: 数据会丢失吗？**
A: 不会。迁移脚本会自动备份原JSON文件。

**Q: 可以同时使用JSON和SQLite吗？**
A: 不建议。选择一种存储方式即可。

**Q: 如何查看SQLite数据？**
A: 使用SQLite客户端工具，如：
```bash
sqlite3 db/db.sqlite
.tables
SELECT * FROM note_mng WHERE is_delete=0;
```

**Q: 迁移需要多久？**
A: 通常几秒钟。取决于笔记数量。

## 支持

如有问题，请检查：
1. Python版本（需要3.7+）
2. SQLAlchemy是否已安装
3. 数据库文件权限
4. 日志输出信息
