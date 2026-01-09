"""Database repositories package."""
from .base import BaseRepository
from .agent_repository import (
    AgentCfgRepository,
    AgentTaskRepository,
    AgentTaskMultiRepository,
    MutiAgentCfgRepository
)
from .chat_repository import (
    AIChatMessagesRepository,
    AIFriendRepository,
    AIChatInformRepository,
    AiChatCfgRepository,
    HumanChatCfgRepository
)
from .km_repository import (
    KMCfgRepository,
    KMDataRepository,
    NoteMngRepository
)
from .map_repository import (
    MapCfgRepository,
    MapTaskRepository,
    MapToolRepository,
    MapTradeRepository,
    MapVisitRepository,
    MapActivityRepository,
    MapPresetMsgRepository,
    ChatPresetMsgRepository
)
from .system_repository import (
    SystemCfgRepository,
    LogsMngRepository,
    SysConfigRepository,
    SystemInitRepository,
    KeyValueRepository,
    PluginMngRepository,
    FunctionMngRepository,
    McpMngRepository,
    SkillMngRepository,
    WebMngRepository,
    WorkflowMngRepository,
    TaskScheduleRepository,
    PromptRepository,
    PromptFrequentRepository,
    LlmFrequentRepository,
    QuestionRepository,
    ModelMetricsRepository,
    ToolListRepository
)

__all__ = [
    # Base
    'BaseRepository',

    # Agent repositories
    'AgentCfgRepository',
    'AgentTaskRepository',
    'AgentTaskMultiRepository',
    'MutiAgentCfgRepository',

    # Chat repositories
    'AIChatMessagesRepository',
    'AIFriendRepository',
    'AIChatInformRepository',
    'AiChatCfgRepository',
    'HumanChatCfgRepository',

    # KM repositories
    'KMCfgRepository',
    'KMDataRepository',
    'NoteMngRepository',

    # Map repositories
    'MapCfgRepository',
    'MapTaskRepository',
    'MapToolRepository',
    'MapTradeRepository',
    'MapVisitRepository',
    'MapActivityRepository',
    'MapPresetMsgRepository',
    'ChatPresetMsgRepository',

    # System repositories
    'SystemCfgRepository',
    'LogsMngRepository',
    'SysConfigRepository',
    'SystemInitRepository',
    'KeyValueRepository',
    'PluginMngRepository',
    'FunctionMngRepository',
    'McpMngRepository',
    'SkillMngRepository',
    'WebMngRepository',
    'WorkflowMngRepository',
    'TaskScheduleRepository',
    'PromptRepository',
    'PromptFrequentRepository',
    'LlmFrequentRepository',
    'QuestionRepository',
    'ModelMetricsRepository',
    'ToolListRepository'
]
