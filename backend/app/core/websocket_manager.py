import logging
from typing import List, Dict, Any
from fastapi import WebSocket

logger = logging.getLogger("ecotrack.websocket")

class ConnectionManager:
    """Manages active WebSocket connections and broadcasts real-time telemetry events."""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"[WebSocket] New client connected. Total active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"[WebSocket] Client disconnected. Total active connections: {len(self.active_connections)}")

    async def broadcast(self, message: Dict[str, Any]):
        if not self.active_connections:
            return
        
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"[WebSocket] Failed to send message to client: {e}")
                disconnected.append(connection)

        for connection in disconnected:
            self.disconnect(connection)

ws_manager = ConnectionManager()
