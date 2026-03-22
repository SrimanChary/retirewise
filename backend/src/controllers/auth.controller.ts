import bcrypt from 'bcryptjs'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import { logger } from '../utils/logger'
import { prisma } from '../utils/prisma'

const REFRESH_DAYS = 7

function makeAccessToken(userId: string, role: string) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET as string, { expiresIn: '15m' })
}

async function makeRefreshToken(userId: string) {
  const token = uuid()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + REFRESH_DAYS)
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } })
  return token
}

export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body
  if (!email || !password || !name)
    return res.status(400).json({ error: 'email, password and name are required' })

  try {
    if (await prisma.user.findUnique({ where: { email } }))
      return res.status(409).json({ error: 'Email already registered' })

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true, role: true },
    })
    await prisma.auditLog.create({
      data: { userId: user.id, action: 'USER_REGISTERED', entity: 'User', entityId: user.id, ipAddress: req.ip },
    })
    const accessToken = makeAccessToken(user.id, user.role)
    const refreshToken = await makeRefreshToken(user.id)
    logger.info('User registered', { userId: user.id })
    return res.status(201).json({ user, accessToken, refreshToken })
  } catch (err) {
    logger.error('Register error', { err })
    return res.status(500).json({ error: 'Registration failed' })
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ error: 'email and password required' })

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ error: 'Invalid credentials' })

    await prisma.auditLog.create({
      data: { userId: user.id, action: 'USER_LOGIN', entity: 'User', entityId: user.id, ipAddress: req.ip },
    })
    const accessToken = makeAccessToken(user.id, user.role)
    const refreshToken = await makeRefreshToken(user.id)
    logger.info('User logged in', { userId: user.id })
    return res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken,
    })
  } catch (err) {
    logger.error('Login error', { err })
    return res.status(500).json({ error: 'Login failed' })
  }
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' })

  try {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await prisma.refreshToken.delete({ where: { token: refreshToken } })
      return res.status(401).json({ error: 'Invalid or expired refresh token' })
    }
    await prisma.refreshToken.delete({ where: { token: refreshToken } })
    const accessToken = makeAccessToken(stored.userId, stored.user.role)
    const newRefreshToken = await makeRefreshToken(stored.userId)
    return res.json({ accessToken, refreshToken: newRefreshToken })
  } catch (err) {
    logger.error('Refresh error', { err })
    return res.status(500).json({ error: 'Token refresh failed' })
  }
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body
  if (refreshToken)
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } }).catch(() => {})
  return res.json({ message: 'Logged out' })
}

export async function getMe(req: Request, res: Response) {
  const userId = (req as any).user.userId
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })
  if (!user) return res.status(404).json({ error: 'User not found' })
  return res.json(user)
}
