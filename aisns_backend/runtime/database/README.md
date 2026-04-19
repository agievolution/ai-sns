# Database Layer Refactoring

This document describes the refactoring of the database layer from the monolithic `DBFactory.py` file into a well-organized, modular structure.

## Structure Overview

```
backend/
└── database/
    ├── __init__.py              # Package entry point
    ├── base.py                  # Session management and configuration
    ├── models/                  # ORM model definitions
    │   ├── __init__.py
    │   ├── agent.py            # Agent-related models
    │   ├── chat.py             # Chat and messaging models
    │   ├── km.py               # Knowledge management models
    │   ├── map.py              # Map-related models
    │   └── system.py           # System configuration models
    └── repositories/            # Data access layer (CRUD operations)
        ├── __init__.py
        ├── base.py             # Base repository with common CRUD
        ├── agent_repository.py
        ├── chat_repository.py
        ├── km_repository.py
        ├── map_repository.py
        └── system_repository.py
```

## Models Classification

### Agent Models (`models/agent.py`)
- **AgentCfg**: Agent configuration
- **AgentTask**: Single agent task
- **AgentTaskMulti**: Multi-agent task
- **MutiAgentCfg**: Multi-agent configuration

### Chat Models (`models/chat.py`)
- **AIChatMessages**: AI chat messages
- **AIFriend**: AI friend contacts
- **AIChatInform**: Chat notifications
- **AiSnsCfg**: AI chat configuration
- **HumanChatCfg**: Human chat configuration

### Knowledge Management Models (`models/km.py`)
- **KMCfg**: Knowledge base configuration
- **KMData**: Knowledge base data
- **NoteMng**: Note management

### Map Models (`models/map.py`)
- **MapCfg**: Map configuration
- **MapTask**: Map tasks
- **MapTool**: Map tools
- **MapTrade**: Map trades
- **MapVisit**: Map visits
- **MapActivity**: Map activities
- **MapPresetMsg**: Map preset messages
- **ChatPresetMsg**: Chat preset messages

### System Models (`models/system.py`)
- **SystemCfg**: System configuration
- **LogsMng**: Logs management
- **SysConfig**: System config
- **SystemInit**: System initialization
- **KeyValue**: Key-value storage
- **PluginMng**: Plugin management
- **FunctionMng**: Function management
- **McpMng**: MCP management
- **SkillMng**: Skill management
- **WebMng**: Web management
- **WorkflowMng**: Workflow management
- **TaskSchedule**: Task scheduling
- **Prompt**: Prompt templates
- **PromptFrequent**: Frequent prompts
- **LlmFrequent**: Frequent LLMs
- **Question**: Questions
- **ModelMetrics**: Model metrics
- **ToolList**: Tool list view

## Repository Pattern

Each repository provides domain-specific CRUD operations:

### Base Repository (`repositories/base.py`)
Common CRUD operations available in all repositories:
- `create(**kwargs)`: Create a new record
- `get_by_id(id)`: Get record by ID
- `get_all(**filters)`: Get all records with optional filters
- `get_one(**filters)`: Get one record with filters
- `update(id, **kwargs)`: Update a record by ID
- `update_by_filter(filters, **kwargs)`: Update by custom filters
- `delete(id)`: Delete a record by ID
- `delete_by_filter(**filters)`: Delete by custom filters
- `count(**filters)`: Count records
- `exists(**filters)`: Check if record exists

### Specialized Repositories
Each domain repository extends `BaseRepository` with specialized methods:

**AgentTaskRepository**:
- `create_with_id()`: Create and return ID
- `get_with_label_filter()`: Get tasks with label filtering
- `get_labels_by_agent()`: Get distinct labels
- `get_conversation_content()`: Get full conversation
- `search_content()`: Search by keywords
- `update_stick_time()`: Pin/unpin tasks
- `delete_by_task_id()`: Delete conversation

**AIChatMessagesRepository**:
- `get_previous_messages()`: Pagination support
- `get_all_ordered()`: Ordered by stick time
- `get_labels()`: Get distinct labels
- `search_content()`: Search messages
- `get_conversation_content()`: Get full conversation

**KMCfgRepository**:
- `get_all_ordered()`: Ordered by position
- `update_by_km_id()`: Update by km_id
- `delete_by_km_id()`: Delete by km_id

**MapCfgRepository**:
- `create_with_id()`: Create and return ID
- `get_all_ordered()`: Ordered results
- `get_single()`: Get single record

## Migration Guide

### Old Code (DBFactory.py)
```python
from db.DBFactory import add_AgentTask, query_AgentTask, update_AgentTask, delete_AgentTask

# Create
add_AgentTask(task_id="123", title="Test", problem="Q", answer="A", ...)

# Read
tasks = query_AgentTask(agent_id="agent1")

# Update
update_AgentTask(id=1, title="Updated")

# Delete
delete_AgentTask(id=1)
```

### New Code (Refactored)
```python
from runtime.database.repositories import AgentTaskRepository

repo = AgentTaskRepository()

# Create
task_id = repo.create_with_id(
    task_id="123",
    title="Test",
    problem="Q",
    answer="A",
    ...
)

# Read
tasks = repo.get_all(agent_id="agent1")

# Update
repo.update(id=1, title="Updated")

# Delete
repo.delete(id=1)
```

## Benefits

1. **Separation of Concerns**: Models and CRUD operations are separated
2. **Type Safety**: Generic typing for repositories
3. **Reusability**: Base repository provides common operations
4. **Maintainability**: Organized by domain
5. **Testability**: Easy to mock and test repositories
6. **Scalability**: Easy to add new models and operations
7. **Documentation**: Clear structure and docstrings

## Database Session Management

### Old Way
```python
from db.DBFactory import Session

session = Session()
try:
    # operations
    session.commit()
except:
    session.rollback()
finally:
    session.close()
```

### New Way
```python
from runtime.database.base import get_session

session = get_session()
try:
    # operations
    session.commit()
except:
    session.rollback()
finally:
    session.close()
```

Or use repositories which handle session management automatically:
```python
from runtime.database.repositories import AgentTaskRepository

repo = AgentTaskRepository()
tasks = repo.get_all()  # Session managed automatically
```

## Table Creation

### Old Way
```python
from db.DBFactory import Base, engine

Base.metadata.create_all(engine)
```

### New Way
```python
from runtime.database import create_all_tables

create_all_tables()
```

## Next Steps

1. **Update existing code** to use the new repository pattern
2. **Add unit tests** for repositories
3. **Add database migrations** support (Alembic)
4. **Add connection pooling** configuration
5. **Add async support** if needed
6. **Document complex queries** in repository methods

## Notes

- The original `DBFactory.py` file is preserved for reference
- All model definitions are unchanged, only relocated
- CRUD operations are wrapped in repository methods
- Session management is improved with proper context handling
- Type hints added for better IDE support
