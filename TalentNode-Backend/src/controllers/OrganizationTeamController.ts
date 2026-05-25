import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import { randomBytes } from 'crypto'

import OrganizationTeamMemberModel from '../models/OrganizationTeamMemberModel.js'
import OrganizationModel from '../models/OrganizationModel.js'
import OrganizationInviteModel from '../models/OrganizationInviteModel.js'
import JobHiringTeamMemberModel from '../models/JobHiringTeamMemberModel.js'
import UserModel from '../models/UserModel.js'
import { isOrganizationAdmin } from '../authorization/organizationAccess.js'
import { getAuthUserId, getOrganizationIdFromUserId } from './helpers/controllerUtils.js'
import { inviteOrganizationTeamMemberSchema } from '../validations/organizationSchemas.js'
import { sendOrganizationInviteEmail } from '../utils/email.js'

const formatZodErrors = (issues: Array<{ path: PropertyKey[]; message: string }>) =>
  issues.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
  }))

const getFrontendBaseUrl = () =>
  (process.env.FRONTEND_URL || process.env.CLIENT_BASE_URL || 'http://localhost:5173')
    .replace(/\/$/, '')

const createInviteToken = () => randomBytes(32).toString('hex')

const requireOrganizationAdminAccess = async (
  userId: string,
  organizationId: string,
  res: Response,
) => {
  if (!(await isOrganizationAdmin(userId, organizationId))) {
    res.status(403).json({
      success: false,
      message: 'Only organization admins can manage team invites',
    })
    return false
  }

  return true
}

const getTeamMembersForOrganization = async (req: Request, res: Response) => {
  try {
    const userId = await getAuthUserId(req, res)
    if (!userId) return

    if (!mongoose.isValidObjectId(userId)) {
      console.error('Invalid userId in getTeamMembersForOrganization:', userId)
      return res.status(400).json({ success: false, message: 'Invalid user' })
    }

    // Only allow listing the current user's organization team
    const organizationId = await getOrganizationIdFromUserId(userId, res)
    if (!organizationId) return

    if (!(await requireOrganizationAdminAccess(userId, organizationId, res))) return

    if (!mongoose.isValidObjectId(organizationId)) {
      console.error(
        'Invalid organizationId in getTeamMembersForOrganization:',
        organizationId,
      )
      return res.status(400).json({ success: false, message: 'Invalid organization' })
    }

    // Verify organization exists (use organizationId directly).
    // NOTE: Avoid calling OrganizationController logic that may mis-handle params.
    const organization = await OrganizationModel.findOne({ _id: organizationId })
    if (!organization) {
      return res
        .status(404)
        .json({ success: false, message: 'Organization not found' })
    }


    // Primary query
    let members = await OrganizationTeamMemberModel.find({ organizationId })
      .populate('userId')
      .lean()

    // Self-heal: ensure org owner exists in the team list
    // (frontend expects at least the creator to appear)
    if (members.length === 0) {
      const orgOwnerUserId = String(organization.createdBy)

      await OrganizationTeamMemberModel.findOneAndUpdate(
        { organizationId, userId: orgOwnerUserId },
        {
          $setOnInsert: {
            organizationId,
            userId: orgOwnerUserId,
            role: 'admin',
          },
        },
        { upsert: true, new: true },
      )

      members = await OrganizationTeamMemberModel.find({ organizationId })
        .populate('userId')
        .lean()
    }

    const team = members.map((m: any) => {
      const u = m.userId
      return {
        id: u?._id ? String(u._id) : String(m.userId),
        username: u?.username ?? null,
        email: u?.email ?? null,
        role: m.role ?? u?.role ?? null,
      }
    })

    return res.status(200).json({ success: true, organizationId, team })
  } catch (error) {
    const err = error as any
    console.error('Error fetching organization team:', {
      name: err?.name,
      message: err?.message,
      stack: err?.stack,
    })
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const inviteTeamMemberToOrganization = async (req: Request, res: Response) => {
  try {
    const userId = await getAuthUserId(req, res)
    if (!userId) return

    const organizationId = await getOrganizationIdFromUserId(userId, res)
    if (!organizationId) return

    if (!(await requireOrganizationAdminAccess(userId, organizationId, res))) return

    const parsedBody = inviteOrganizationTeamMemberSchema.safeParse(req.body)
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formatZodErrors(parsedBody.error.issues),
      })
    }

    const { email, role } = parsedBody.data

    const organization = await OrganizationModel.findById(organizationId)
    if (!organization) {
      return res.status(404).json({ success: false, message: 'Organization not found' })
    }

    const existingUser = await UserModel.findOne({ email })
    if (existingUser) {
      const existingMember = await OrganizationTeamMemberModel.findOne({
        organizationId,
        userId: existingUser._id,
      })

      if (existingMember) {
        return res.status(409).json({
          success: false,
          message: 'This user is already a member of your organization',
        })
      }
    }

    await OrganizationInviteModel.updateMany(
      { organizationId, invitedEmail: email, status: 'pending' },
      { status: 'revoked' },
    )

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const invite = await OrganizationInviteModel.create({
      organizationId,
      invitedEmail: email,
      invitedBy: userId,
      role,
      token: createInviteToken(),
      status: 'pending',
      expiresAt,
    })

    const inviter = await UserModel.findById(userId).select('username email')
    const inviteUrl = `${getFrontendBaseUrl()}/accept-invite/${invite.token}`

    await sendOrganizationInviteEmail({
      to: email,
      organizationName: organization.name,
      inviterName: inviter?.username || inviter?.email || 'A team admin',
      role,
      inviteUrl,
    })

    return res.status(201).json({
      success: true,
      message: 'Invite created successfully',
      invite: {
        id: invite._id,
        email: invite.invitedEmail,
        role: invite.role,
        status: invite.status,
        expiresAt: invite.expiresAt,
        inviteUrl,
      },
    })
  } catch (error) {
    console.error('Error creating organization invite:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const getOrganizationInviteByToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params
    const invite = await OrganizationInviteModel.findOne({ token })
      .populate('organizationId', 'name')
      .lean()

    if (!invite) {
      return res.status(404).json({ success: false, message: 'Invite not found' })
    }

    const isExpired = invite.expiresAt.getTime() <= Date.now()
    if (invite.status === 'pending' && isExpired) {
      await OrganizationInviteModel.updateOne({ _id: invite._id }, { status: 'expired' })
    }

    const organization = invite.organizationId as any

    return res.status(200).json({
      success: true,
      invite: {
        email: invite.invitedEmail,
        role: invite.role,
        status: isExpired ? 'expired' : invite.status,
        expiresAt: invite.expiresAt,
        organization: {
          id: organization?._id ? String(organization._id) : String(invite.organizationId),
          name: organization?.name ?? null,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching organization invite:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const acceptOrganizationInvite = async (req: Request, res: Response) => {
  try {
    const userId = await getAuthUserId(req, res)
    if (!userId) return

    const { token } = req.params
    const invite = await OrganizationInviteModel.findOne({ token })

    if (!invite) {
      return res.status(404).json({ success: false, message: 'Invite not found' })
    }

    if (invite.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message: `Invite is already ${invite.status}`,
      })
    }

    if (invite.expiresAt.getTime() <= Date.now()) {
      invite.status = 'expired'
      await invite.save()
      return res.status(410).json({ success: false, message: 'Invite has expired' })
    }

    const user = await UserModel.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    if (user.email.toLowerCase() !== invite.invitedEmail.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Please log in with the email address this invite was sent to',
      })
    }

    await OrganizationTeamMemberModel.findOneAndUpdate(
      { organizationId: invite.organizationId, userId },
      {
        $set: {
          role: invite.role,
        },
        $setOnInsert: {
          organizationId: invite.organizationId,
          userId,
        },
      },
      { upsert: true, new: true },
    )

    // Treat organizationId as the user's active organization. Membership lives
    // in OrganizationTeamMember, so accepting an invite can switch active org.
    user.organizationId = invite.organizationId
    user.role = invite.role
    await user.save()

    invite.status = 'accepted'
    invite.acceptedBy = user._id as mongoose.Types.ObjectId
    invite.acceptedAt = new Date()
    await invite.save()

    const organization = await OrganizationModel.findById(invite.organizationId).select('name slug')

    return res.status(200).json({
      success: true,
      message: 'Invite accepted successfully',
      organization: organization
        ? {
            id: organization._id,
            name: organization.name,
            slug: organization.slug,
          }
        : null,
    })
  } catch (error) {
    console.error('Error accepting organization invite:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const deactivateTeamMember = async (req: Request, res: Response) => {
  try {
    const actorId = await getAuthUserId(req, res)
    if (!actorId) return

    const organizationId = await getOrganizationIdFromUserId(actorId, res)
    if (!organizationId) return

    if (!(await requireOrganizationAdminAccess(actorId, organizationId, res))) return

    const targetUserId = Array.isArray(req.params.userId)
      ? req.params.userId[0]
      : req.params.userId

    if (!targetUserId || !mongoose.isValidObjectId(targetUserId)) {
      return res.status(400).json({ success: false, message: 'Invalid user' })
    }

    if (String(targetUserId) === String(actorId)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate yourself',
      })
    }

    const organization = await OrganizationModel.findById(organizationId).select(
      'createdBy',
    )
    if (organization && String(organization.createdBy) === String(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate the organization owner',
      })
    }

    const removed = await OrganizationTeamMemberModel.findOneAndDelete({
      organizationId,
      userId: targetUserId,
    })

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found',
      })
    }

    await JobHiringTeamMemberModel.deleteMany({
      organizationId,
      userId: targetUserId,
    })

    const targetUser = await UserModel.findById(targetUserId)
    if (targetUser && String(targetUser.organizationId) === String(organizationId)) {
      targetUser.organizationId = undefined
      targetUser.role = 'candidate'
      await targetUser.save()
    }

    return res.status(200).json({
      success: true,
      message: 'Team member deactivated successfully',
    })
  } catch (error) {
    console.error('Error deactivating team member:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

const revokeOrganizationInvite = async (req: Request, res: Response) => {
  try {
    const userId = await getAuthUserId(req, res)
    if (!userId) return

    const organizationId = await getOrganizationIdFromUserId(userId, res)
    if (!organizationId) return

    if (!(await requireOrganizationAdminAccess(userId, organizationId, res))) return

    const invite = await OrganizationInviteModel.findOneAndUpdate(
      {
        _id: req.params.inviteId,
        organizationId,
        status: 'pending',
      },
      { status: 'revoked' },
      { new: true },
    )

    if (!invite) {
      return res.status(404).json({ success: false, message: 'Pending invite not found' })
    }

    return res.status(200).json({
      success: true,
      message: 'Invite revoked successfully',
    })
  } catch (error) {
    console.error('Error revoking organization invite:', error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export {
  acceptOrganizationInvite,
  deactivateTeamMember,
  getOrganizationInviteByToken,
  getTeamMembersForOrganization,
  inviteTeamMemberToOrganization,
  revokeOrganizationInvite,
}
