import asyncio

from mcp import ClientSession
from mcp.client.streamable_http import streamablehttp_client


async def main() -> None:
    url = "http://127.0.0.1:3089/mcp"
    async with streamablehttp_client(url, {}) as (read_stream, write_stream):
        async with ClientSession(read_stream, write_stream) as session:
            await session.initialize()
            tools = await session.list_tools()
            print([t.name for t in (tools.tools or [])])


if __name__ == "__main__":
    asyncio.run(main())
