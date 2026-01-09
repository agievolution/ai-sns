# -*- coding: utf-8 -*-
"""
Chat module - SSE streaming functionality
"""
import json
import logging
import httpx
from typing import AsyncGenerator

logger = logging.getLogger(__name__)


class StreamingService:
    """Service for handling SSE streaming chat"""

    @staticmethod
    async def stream_chat(
        messages: list,
        ai_config: dict,
        model: str,
        temperature: float,
        max_tokens: int
    ) -> AsyncGenerator:
        """
        Stream chat responses using Server-Sent Events

        Args:
            messages: List of chat messages
            ai_config: AI configuration dictionary
            model: Model name
            temperature: Temperature parameter
            max_tokens: Max tokens parameter

        Yields:
            SSE event dictionaries
        """
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                api_url = f"{ai_config['api_base'].rstrip('/')}/chat/completions"

                request_data = {
                    "model": model,
                    "messages": messages,
                    "stream": True,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                }

                logger.info(f"Streaming chat request to: {api_url}")
                logger.info(f"Using model: {model}")

                async with client.stream(
                    'POST',
                    api_url,
                    json=request_data,
                    headers={
                        'Authorization': f"Bearer {ai_config['api_key']}",
                        'Content-Type': 'application/json'
                    }
                ) as response:
                    if response.status_code != 200:
                        error_text = await response.aread()
                        logger.error(f"API error: {response.status_code} - {error_text.decode()}")
                        yield {
                            "event": "error",
                            "data": json.dumps({
                                "error": f"HTTP {response.status_code}: {error_text.decode()}"
                            })
                        }
                        return

                    buffer = ""
                    async for chunk in response.aiter_bytes():
                        chunk_str = chunk.decode('utf-8')
                        buffer += chunk_str

                        lines = buffer.split('\n')
                        buffer = lines.pop() if lines else ""

                        for line in lines:
                            line = line.strip()
                            if line.startswith('data: '):
                                data = line[6:]
                                if data == '[DONE]':
                                    yield {
                                        "event": "done",
                                        "data": json.dumps({"status": "completed"})
                                    }
                                    return
                                try:
                                    parsed = json.loads(data)
                                    choices = parsed.get('choices', [])
                                    if choices and len(choices) > 0:
                                        content = choices[0].get('delta', {}).get('content', '')
                                        if content:
                                            yield {
                                                "event": "message",
                                                "data": json.dumps({"content": content})
                                            }
                                except json.JSONDecodeError as e:
                                    logger.debug(f"JSON parse error: {e} for line: {line}")
                                    continue

                    # Process remaining buffer
                    if buffer.strip():
                        line = buffer.strip()
                        if line.startswith('data: ') and line[6:] != '[DONE]':
                            try:
                                parsed = json.loads(line[6:])
                                choices = parsed.get('choices', [])
                                if choices and len(choices) > 0:
                                    content = choices[0].get('delta', {}).get('content', '')
                                    if content:
                                        yield {
                                            "event": "message",
                                            "data": json.dumps({"content": content})
                                        }
                            except json.JSONDecodeError:
                                pass

                    yield {
                        "event": "done",
                        "data": json.dumps({"status": "completed"})
                    }

        except Exception as e:
            logger.error(f"Stream chat error: {e}")
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)})
            }
