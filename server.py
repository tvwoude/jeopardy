# server.py
import asyncio
import websockets
import json

clients = set()

async def handler(websocket):  # only websocket, no path
    clients.add(websocket)
    try:
        async for message in websocket:
            data = json.loads(message)
            print("📨 Received:", data)

            # Broadcast to all *other* clients
            dead = []
            for client in clients:
                if client != websocket:
                    try:
                        await client.send(message)
                    except:
                        dead.append(client)

            for d in dead:
                clients.remove(d)

    finally:
        clients.remove(websocket)

async def main():
    async with websockets.serve(handler, "localhost", 8000):
        print("🚀 Jeopardy server running at ws://localhost:8000")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
