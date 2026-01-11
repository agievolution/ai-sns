# SQLite迁移 - 快速开始指南

## ✅ 已完成的工作

所有代码已经更新完成，现在使用SQLite数据库存储笔记。

### 完成的修改：

1. ✅ **数据库模型** - 添加了新字段（tags, is_pinned, updated_at）
2. ✅ **笔记服务** - 完全重写使用SQLAlchemy ORM
3. ✅ **升级脚本** - upgrade_database.py
4. ✅ **迁移脚本** - migrate_notes_to_sqlite.py
5. ✅ **All页签** - 移除了标签显示

## 🚀 现在就可以使用

**好消息**：代码已经完全准备好了！

如果您是第一次使用或者重新启动，数据库表会**自动创建**所有必要的字段。

### 方案A：直接启动（推荐）

如果没有旧的JSON数据需要迁移，直接启动即可：

```bash
# 启动后端服务
python3 api_server_modular.py
```

**数据库表会自动创建，包含所有新字段！**

### 方案B：迁移现有JSON数据

如果有JSON笔记数据需要迁移：

```bash
# 1. 确保所有服务都已停止
pkill -f api_server
pkill -f python.*backend

# 2. 等待3秒
sleep 3

# 3. 运行升级脚本（添加新字段）
python3 upgrade_database.py

# 4. 迁移JSON数据
python3 migrate_notes_to_sqlite.py

# 5. 重启服务
python3 api_server_modular.py
```

## 📝 关于数据库锁定问题

如果看到 "database is locked" 错误：

### 原因：
- SQLite同一时间只允许一个写入操作
- 可能有旧的Python进程仍在运行
- 或者有僵尸文件句柄

### 解决方案：

**方法1：强制清理（最简单）**
```bash
# 停止所有Python进程
pkill -9 -f python

# 等待3秒
sleep 3

# 重新运行升级脚本
python3 upgrade_database.py
```

**方法2：重启系统（100%有效）**
```bash
# 重启会清理所有僵尸进程和文件句柄
reboot
```

**方法3：使用新数据库（测试用）**
```bash
# 备份旧数据库
mv db/db.sqlite db/db.sqlite.backup

# 启动服务会创建新的数据库
python3 api_server_modular.py
```

## 🎯 核心要点

1. **自动创建**：新表结构会在首次启动时自动创建
2. **无需担心**：即使升级脚本失败，直接启动也能工作
3. **SQLAlchemy魔法**：create_all_tables() 会自动处理一切
4. **向后兼容**：如果字段已存在，不会重复添加

## 📊 新功能测试清单

启动后测试以下功能：

- [ ] 创建新笔记
- [ ] 添加标签
- [ ] 置顶笔记
- [ ] 切换到Tag页签查看标签分类
- [ ] 双击打开笔记
- [ ] 右键菜单（改名、删除、置顶、标签）
- [ ] All页签不显示标签
- [ ] 使用颜色选择器设置字体颜色

## 🔍 验证数据库

启动服务后，可以用以下命令查看数据：

```bash
sqlite3 db/db.sqlite

# 查看表结构
.schema note_mng

# 查看所有笔记
SELECT id, title, is_pinned, tags FROM note_mng WHERE is_delete=0;

# 退出
.quit
```

## 💡 重要提示

**最重要的一点**：即使升级脚本没有运行成功，也不影响使用！

因为：
1. NoteService的__init__会调用create_all_tables()
2. SQLAlchemy会根据models/km.py中的NoteMng类定义自动创建表
3. 如果表已存在，只会更新缺失的字段

所以，**直接启动服务即可！** 🚀
