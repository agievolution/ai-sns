from mcp.server.fastmcp import FastMCP

mcp = FastMCP(
    "EchoStreamableHTTP",
    host="127.0.0.1",
    port=3089,
    stateless_http=True,
    json_response=True,
)


@mcp.tool()
def echo(message: str) -> str:
    return f"Echo: {message}"


if __name__ == "__main__":
    mcp.run(transport="streamable-http")
