from mcp.server.fastmcp import FastMCP

mcp = FastMCP("EchoSSE", host="127.0.0.1", port=3088)


@mcp.tool()
def echo(message: str) -> str:
    return f"Echo: {message}"


if __name__ == "__main__":
    mcp.run(transport="sse")
