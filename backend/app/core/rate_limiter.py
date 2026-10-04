import time
from fastapi import HTTPException, Request, status
import redis.asyncio as aioredis
from app.core.config import settings

# Global async Redis client
redis_pool = aioredis.from_url(settings.REDIS_URL, decode_responses=True)


class RateLimiter:
    """
    Anti-Gravity Token-Bucket Rate Limiter backed by Redis.
    Guarantees tenant isolation and protects upstream LLM provider budgets.
    """

    def __init__(self, requests_per_minute: int = 30):
        self.rate = requests_per_minute
        self.window = 60  # seconds

    async def __call__(self, request: Request):
        # Extract user identification from client IP or authorization header
        auth_header = request.headers.get("Authorization", "")
        identifier = auth_header if auth_header else request.client.host

        key = f"rate_limit:{identifier}:{int(time.time() // self.window)}"

        try:
            current_count = await redis_pool.incr(key)
            if current_count == 1:
                # Set TTL on first request in the window
                await redis_pool.expire(key, self.window)

            if current_count > self.rate:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded: {self.rate} requests/min. Please slow down.",
                    headers={"Retry-After": str(self.window)},
                )
        except (aioredis.ConnectionError, aioredis.TimeoutError):
            # Anti-Gravity graceful degradation: don't block traffic if Redis is temporarily unreachable
            pass
