"""Example usage of the refactored database layer.

This file demonstrates how to use the new repository pattern
for database operations.
"""

from backend.database import create_all_tables, models, repositories


def example_agent_operations():
    """Example: Agent CRUD operations."""
    print("=== Agent Operations ===")

    # Initialize repository
    agent_repo = repositories.AgentCfgRepository()
    task_repo = repositories.AgentTaskRepository()

    # Create an agent
    # agent_id = agent_repo.create(
    #     user_id="user_001",
    #     name="Test Agent",
    #     memo="Test agent for demo",
    #     plugins="plugin1,plugin2",
    #     kms="km1,km2"
    # )
    # print(f"Created agent with ID: {agent_id}")

    # Query agents
    agents = agent_repo.get_all(is_delete=False)
    print(f"Found {len(agents)} agents")

    # Get agent by ID
    if agents:
        agent = agent_repo.get_by_id(agents[0].id)
        print(f"Agent: {agent.name if agent else 'Not found'}")

    # Get agent system prompt
    prompt = agent_repo.get_system_prompt("Test Agent")
    print(f"System prompt: {prompt}")

    # Create a task
    # task_id = task_repo.create_with_id(
    #     task_id="task_001",
    #     title="Test Task",
    #     problem="What is AI?",
    #     answer="AI is...",
    #     agent_id="agent_001",
    #     model_name="gpt-4",
    #     is_first=True
    # )
    # print(f"Created task with ID: {task_id}")

    # Search tasks
    tasks = task_repo.search_content(
        title="Test",
        agent_id="agent_001"
    )
    print(f"Found {len(tasks)} tasks")

    # Get conversation content
    if tasks:
        conversation = task_repo.get_conversation_content(tasks[0].id)
        print(f"Conversation has {len(conversation)} messages")


def example_chat_operations():
    """Example: Chat CRUD operations."""
    print("\n=== Chat Operations ===")

    # Initialize repositories
    message_repo = repositories.AIChatMessagesRepository()
    friend_repo = repositories.AIFriendRepository()

    # Query messages
    messages = message_repo.get_all(is_delete=False)
    print(f"Found {len(messages)} messages")

    # Get previous messages with pagination
    previous_messages = message_repo.get_previous_messages(
        last_record_id=100,
        count=20,
        is_delete=False
    )
    print(f"Found {len(previous_messages)} previous messages")

    # Search messages
    search_results = message_repo.search_content(
        title="hello",
        owner_account="user1@example.com"
    )
    print(f"Found {len(search_results)} matching messages")

    # Get friends ordered by last message time
    friends = friend_repo.get_all_ordered_by_update_time(is_delete=False)
    print(f"Found {len(friends)} friends")


def example_km_operations():
    """Example: Knowledge Management operations."""
    print("\n=== Knowledge Management Operations ===")

    # Initialize repositories
    km_cfg_repo = repositories.KMCfgRepository()
    km_data_repo = repositories.KMDataRepository()
    note_repo = repositories.NoteMngRepository()

    # Query KM configurations
    km_configs = km_cfg_repo.get_all_ordered(is_delete=False)
    print(f"Found {len(km_configs)} knowledge bases")

    # Create a note
    # note_id = note_repo.create_with_id(
    #     note_id="note_001",
    #     title="Test Note",
    #     content="This is a test note",
    #     km_id="km_001",
    #     tag_1="important",
    #     waitvectorization=True
    # )
    # print(f"Created note with ID: {note_id}")

    # Search notes
    notes = note_repo.search_content(
        count=10,
        title="test"
    )
    print(f"Found {len(notes)} matching notes")

    # Get labels
    if km_configs:
        labels = note_repo.get_labels_by_km_id(km_configs[0].km_id)
        print(f"Found {len(labels)} labels: {labels}")


def example_map_operations():
    """Example: Map operations."""
    print("\n=== Map Operations ===")

    # Initialize repositories
    map_cfg_repo = repositories.MapCfgRepository()
    map_task_repo = repositories.MapTaskRepository()
    map_activity_repo = repositories.MapActivityRepository()

    # Query map configurations
    map_configs = map_cfg_repo.get_all_ordered()
    print(f"Found {len(map_configs)} map configurations")

    # Query map tasks
    tasks = map_task_repo.get_all_ordered(is_delete=False)
    print(f"Found {len(tasks)} map tasks")

    # Get previous activities
    activities = map_activity_repo.get_previous_activities(
        count=20,
        type_str="visit"
    )
    print(f"Found {len(activities)} visit activities")


def example_system_operations():
    """Example: System operations."""
    print("\n=== System Operations ===")

    # Initialize repositories
    plugin_repo = repositories.PluginMngRepository()
    prompt_repo = repositories.PromptRepository()
    kv_repo = repositories.KeyValueRepository()

    # Query plugins
    plugins = plugin_repo.get_all(is_delete=False)
    print(f"Found {len(plugins)} plugins")

    # Get tool plugins
    tools = plugin_repo.get_all_tools(is_delete=False)
    print(f"Found {len(tools)} tool plugins")

    # Query prompts
    prompts = prompt_repo.get_all_ordered()
    print(f"Found {len(prompts)} prompts")

    # Get prompt by title
    prompt_content = prompt_repo.get_by_title("System Prompt")
    print(f"Prompt content: {prompt_content[:50] if prompt_content else 'Not found'}...")

    # Key-value operations
    # kv_repo.create(key="api_key", value="test_key_123")
    value = kv_repo.get_value("api_key")
    print(f"API key: {value}")


def example_transaction():
    """Example: Using transactions with repositories."""
    print("\n=== Transaction Example ===")

    from backend.database.base import get_session

    agent_repo = repositories.AgentCfgRepository()
    task_repo = repositories.AgentTaskRepository()

    # Manual transaction control
    session = get_session()
    try:
        # Multiple operations in one transaction
        # agent = agent_repo.create(user_id="user_002", name="Agent 2")
        # task = task_repo.create(task_id="task_002", agent_id=agent.user_id)

        session.commit()
        print("Transaction committed successfully")
    except Exception as e:
        session.rollback()
        print(f"Transaction failed: {e}")
    finally:
        session.close()


def main():
    """Run all examples."""
    print("Database Layer Usage Examples")
    print("=" * 50)

    # Create tables if needed
    # create_all_tables()

    # Run examples
    example_agent_operations()
    example_chat_operations()
    example_km_operations()
    example_map_operations()
    example_system_operations()
    example_transaction()

    print("\n" + "=" * 50)
    print("Examples completed!")


if __name__ == "__main__":
    main()
