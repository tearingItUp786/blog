import { ipKeyGenerator } from 'express-rate-limit'

/**
 * Rate limit key generator that combines an IPv6-subnet-masked IP address
 * with the first path segment to provide per-route, per-IP rate limiting.
 *
 * IPv6 addresses are masked with a /56 subnet (via ipKeyGenerator) to
 * prevent bypass by iterating through ISP-assigned addresses.
 *
 * @param {import('express').Request} req
 * @returns {string}
 */
export function rateLimitKeyGenerator(req) {
	return `${ipKeyGenerator(req.ip)}:${req.path.split('/')[1]}`
}
