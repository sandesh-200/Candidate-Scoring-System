import asyncio
import json
from collections import defaultdict


class SSEManager:
    def __init__(self):
        self._subscribers: dict[int, set[asyncio.Queue]] = defaultdict(set)

    def subscribe(self, candidate_id: int) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue()
        self._subscribers[candidate_id].add(queue)
        return queue

    def unsubscribe(self, candidate_id: int, queue: asyncio.Queue):
        self._subscribers[candidate_id].discard(queue)
        if not self._subscribers[candidate_id]:
            del self._subscribers[candidate_id]

    def publish(self, candidate_id: int, event_data: dict):
        message = json.dumps(event_data)
        for queue in self._subscribers.get(candidate_id, set()):
            queue.put_nowait(message)


sse_manager = SSEManager()
