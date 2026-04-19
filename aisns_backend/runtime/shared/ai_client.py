"""
AI Client Wrapper

Provides a unified interface for interacting with OpenAI-compatible APIs.
Supports both streaming and non-streaming chat completions.
"""

from typing import List, Dict, Optional, AsyncGenerator, Any
import httpx
import json
import logging

from runtime.config.settings import get_settings
from runtime.shared.llm_log_writer import (
    new_request_id,
    log_llm_request,
    log_llm_response,
    log_llm_stream_chunk,
    log_llm_error,
)

logger = logging.getLogger(__name__)


class AIClient:
    """
    OpenAI-compatible API client

    Features:
    - Streaming and non-streaming chat completions
    - Automatic configuration from settings
    - Error handling and logging
    - Token counting (future)
    """

    def __init__(
        self,
        api_base: Optional[str] = None,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        timeout: float = 60.0
    ):
        """
        Initialize AI client

        Args:
            api_base: API base URL (defaults to settings)
            api_key: API key (defaults to settings)
            model: Model name (defaults to settings)
            temperature: Temperature parameter (defaults to settings)
            max_tokens: Max tokens (defaults to settings)
            timeout: HTTP timeout in seconds
        """
        _settings = get_settings()
        self.api_base = api_base or _settings.ai.api_base
        self.api_key = api_key or _settings.ai.api_key
        self.model = model or _settings.ai.model
        self.temperature = temperature if temperature is not None else _settings.ai.temperature
        self.max_tokens = max_tokens or _settings.ai.max_tokens
        self.timeout = timeout

        if not self.api_key:
            logger.warning("AI client initialized without API key")

    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers for API requests"""
        return {
            'Authorization': f"Bearer {self.api_key}",
            'Content-Type': 'application/json'
        }

    def _get_completion_url(self) -> str:
        """Get chat completions endpoint URL"""
        return f"{self.api_base.rstrip('/')}/chat/completions"

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        stream: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Send a chat completion request

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model to use (overrides default)
            temperature: Temperature parameter (overrides default)
            max_tokens: Max tokens (overrides default)
            stream: Whether to stream the response
            **kwargs: Additional parameters to pass to the API

        Returns:
            API response dict

        Raises:
            HTTPException: If the API request fails
        """
        if not self.api_key:
            raise ValueError("API key not configured")

        request_data = {
            "model": model or self.model,
            "messages": messages,
            "temperature": temperature if temperature is not None else self.temperature,
            "max_tokens": max_tokens or self.max_tokens,
            "stream": stream,
            **kwargs
        }

        request_id = new_request_id()
        try:
            log_llm_request(request_id=request_id, source="runtime.shared.ai_client.AIClient.chat_completion", request_json=request_data)
        except Exception:
            pass

        logger.info(f"Chat completion request: model={request_data['model']}, messages={len(messages)}")

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    self._get_completion_url(),
                    json=request_data,
                    headers=self._get_headers()
                )

                if response.status_code != 200:
                    error_text = response.text
                    try:
                        log_llm_error(request_id=request_id, source="runtime.shared.ai_client.AIClient.chat_completion", error=error_text)
                    except Exception:
                        pass
                    logger.error(f"API error {response.status_code}: {error_text}")
                    raise httpx.HTTPError(f"HTTP {response.status_code}: {error_text}")

                data = response.json()
                try:
                    log_llm_response(request_id=request_id, source="runtime.shared.ai_client.AIClient.chat_completion", response_json=data)
                except Exception:
                    pass
                return data
            except Exception as e:
                try:
                    log_llm_error(request_id=request_id, source="runtime.shared.ai_client.AIClient.chat_completion", error=e)
                except Exception:
                    pass
                raise

    async def chat_completion_stream(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Send a streaming chat completion request

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model to use (overrides default)
            temperature: Temperature parameter (overrides default)
            max_tokens: Max tokens (overrides default)
            **kwargs: Additional parameters to pass to the API

        Yields:
            Parsed SSE events as dicts

        Raises:
            HTTPException: If the API request fails
        """
        if not self.api_key:
            raise ValueError("API key not configured")

        request_data = {
            "model": model or self.model,
            "messages": messages,
            "temperature": temperature if temperature is not None else self.temperature,
            "max_tokens": max_tokens or self.max_tokens,
            "stream": True,
            **kwargs
        }

        request_id = new_request_id()
        try:
            log_llm_request(request_id=request_id, source="runtime.shared.ai_client.AIClient.chat_completion_stream", request_json=request_data)
        except Exception:
            pass

        logger.info(f"Streaming chat completion: model={request_data['model']}, messages={len(messages)}")

        done_sent = False
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream(
                    'POST',
                    self._get_completion_url(),
                    json=request_data,
                    headers=self._get_headers()
                ) as response:
                    if response.status_code != 200:
                        error_text = await response.aread()
                        try:
                            log_llm_error(
                                request_id=request_id,
                                source="runtime.shared.ai_client.AIClient.chat_completion_stream",
                                error=error_text.decode(errors="ignore"),
                            )
                        except Exception:
                            pass
                        logger.error(f"API error {response.status_code}: {error_text.decode(errors='ignore')}")
                        raise httpx.HTTPError(f"HTTP {response.status_code}: {error_text.decode(errors='ignore')}")

                    buffer = ""
                    async for chunk in response.aiter_bytes():
                        chunk_str = chunk.decode('utf-8', errors='ignore')
                        buffer += chunk_str

                        lines = buffer.split('\n')
                        buffer = lines.pop() if lines else ""

                        for line in lines:
                            s = line.strip()
                            if not s.startswith('data: '):
                                continue

                            payload = s[6:].strip()
                            if payload == '[DONE]':
                                done_sent = True
                                yield {"event": "done", "data": {"status": "completed"}}
                                break

                            try:
                                parsed = json.loads(payload)
                            except json.JSONDecodeError as e:
                                logger.debug(f"JSON parse error: {e}")
                                continue

                            try:
                                log_llm_stream_chunk(
                                    request_id=request_id,
                                    source="runtime.shared.ai_client.AIClient.chat_completion_stream",
                                    stream_raw=parsed,
                                )
                            except Exception:
                                pass

                            try:
                                choices = parsed.get('choices', [])
                                if choices and len(choices) > 0:
                                    delta = choices[0].get('delta', {})
                                    content = delta.get('content', '')
                                    if content:
                                        yield {
                                            "event": "message",
                                            "data": {"content": content},
                                            "raw": parsed,
                                        }
                            except Exception:
                                continue

                        if done_sent:
                            break

                    if not done_sent and buffer.strip():
                        for raw_line in buffer.splitlines():
                            s = raw_line.strip()
                            if not s.startswith('data: '):
                                continue
                            payload = s[6:].strip()
                            if payload == '[DONE]':
                                done_sent = True
                                break
                            try:
                                parsed = json.loads(payload)
                            except Exception:
                                continue
                            try:
                                log_llm_stream_chunk(
                                    request_id=request_id,
                                    source="runtime.shared.ai_client.AIClient.chat_completion_stream",
                                    stream_raw=parsed,
                                )
                            except Exception:
                                pass
                            try:
                                choices = parsed.get('choices', [])
                                if choices and len(choices) > 0:
                                    delta = choices[0].get('delta', {})
                                    content = delta.get('content', '')
                                    if content:
                                        yield {
                                            "event": "message",
                                            "data": {"content": content},
                                            "raw": parsed,
                                        }
                            except Exception:
                                continue

            if not done_sent:
                yield {"event": "done", "data": {"status": "completed"}}

            try:
                log_llm_response(
                    request_id=request_id,
                    source="runtime.shared.ai_client.AIClient.chat_completion_stream",
                    response_json={"status": "completed"},
                )
            except Exception:
                pass
        except Exception as e:
            try:
                log_llm_error(
                    request_id=request_id,
                    source="runtime.shared.ai_client.AIClient.chat_completion_stream",
                    error=e,
                )
            except Exception:
                pass
            raise

    async def simple_chat(self, user_message: str, system_prompt: Optional[str] = None) -> str:
        """
        Simple chat interface - send a message and get a response

        Args:
            user_message: User's message
            system_prompt: Optional system prompt

        Returns:
            Assistant's response text
        """
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": user_message})

        response = await self.chat_completion(messages)
        return response['choices'][0]['message']['content']

    def check_config(self) -> Dict[str, Any]:
        """
        Check current configuration

        Returns:
            Dict with config status
        """
        return {
            "has_api_key": bool(self.api_key),
            "api_base": self.api_base,
            "model": self.model,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens
        }


def get_ai_client(
    api_base: Optional[str] = None,
    api_key: Optional[str] = None,
    model: Optional[str] = None
) -> AIClient:
    """
    Factory function to create an AI client

    Args:
        api_base: Optional override for API base URL
        api_key: Optional override for API key
        model: Optional override for model

    Returns:
        Configured AIClient instance
    """
    return AIClient(api_base=api_base, api_key=api_key, model=model)


# Module-level client instance (lazy initialization)
_default_client: Optional[AIClient] = None


def get_default_client() -> AIClient:
    """Get or create the default AI client"""
    global _default_client
    if _default_client is None:
        _default_client = AIClient()
    return _default_client
