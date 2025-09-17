// Rate limiting for production API protection
import { NextRequest } from "next/server"

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (use Redis in production for multiple instances)
const store: RateLimitStore = {}

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  skipSuccessfulRequests?: boolean
}

export const RATE_LIMITS = {
  // Image generation: 10 requests per hour
  IMAGE_GENERATION: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
  },
  // Video generation: 3 requests per hour (expensive)
  VIDEO_GENERATION: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
  },
  // Avatar generation: 2 requests per hour (very expensive)
  AVATAR_GENERATION: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 2,
  },
  // General API: 100 requests per 15 minutes
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },
} as const

export function getRateLimitKey(request: NextRequest, identifier: string): string {
  // Use IP address and user identifier for rate limiting
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
  return `${ip}:${identifier}`
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): {
  allowed: boolean
  remaining: number
  resetTime: number
} {
  const now = Date.now()
  const windowStart = now - config.windowMs

  // Clean up old entries
  if (store[key] && store[key].resetTime < windowStart) {
    delete store[key]
  }

  // Initialize or get current count
  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + config.windowMs,
    }
  }

  const current = store[key]
  const allowed = current.count < config.maxRequests

  if (allowed) {
    current.count++
  }

  return {
    allowed,
    remaining: Math.max(0, config.maxRequests - current.count),
    resetTime: current.resetTime,
  }
}

export function rateLimitHeaders(remaining: number, resetTime: number) {
  return {
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(resetTime / 1000).toString(),
    "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
  }
}