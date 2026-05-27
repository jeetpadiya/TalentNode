import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import CandidateModel from '../models/CandidateModel.js';
import JobCandidateAssignmentModel from '../models/JobCandidateAssignmentModel.js';
import { getParamValue } from '../utils/ParamValue.js';
import { sendCandidateEmail } from '../utils/email.js';
import {
  ensureCandidateApplicationForAssignment,
  findCandidateApplicationForAssignment,
} from './helpers/controllerUtils.js';

export const sendEmailToCandidate = async (req: Request, res: Response) => {
  try {
    const jobId = getParamValue(req.params.jobId);
    const applicationId = getParamValue(req.params.applicationId);
    const { subject, body } = req.body;
    const userId = req.user?.id;
    const organizationId = req.organization?.organizationId;

    if (!userId || !organizationId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (
      !jobId ||
      !applicationId ||
      !mongoose.isValidObjectId(jobId) ||
      !mongoose.isValidObjectId(applicationId)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid ID formats' });
    }

    if (!subject || !body) {
      return res.status(400).json({ success: false, message: 'Subject and body are required' });
    }

    // applicationId is the JobCandidateAssignment ID
    const assignment = await JobCandidateAssignmentModel.findOne({
      _id: applicationId,
      jobId,
      organizationId,
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const candidateId = assignment.candidateId;

    // Find the candidate to get their email address
    const candidate = await CandidateModel.findOne({
      _id: candidateId,
      organizationId,
    });

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    // Send the email
    try {
      await sendCandidateEmail({
        to: candidate.email,
        subject,
        htmlBody: body,
      });
    } catch (emailError) {
      console.error('Failed to send email via SMTP:', emailError);
      return res.status(500).json({ success: false, message: 'Failed to send email through SMTP server' });
    }

    // Log the email in the CandidateApplicationModel
    const application = await ensureCandidateApplicationForAssignment({
      applicationId,
      jobId,
      candidateId,
      organizationId: String(organizationId),
    });

    application.emails.push({
      subject,
      body,
      sentBy: new mongoose.Types.ObjectId(userId),
      createdAt: new Date(),
    });
    await application.save();

    await application.populate('emails.sentBy', 'firstName lastName email profileImageUrl');

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      emailLog: application.emails[application.emails.length - 1],
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getCandidateEmails = async (req: Request, res: Response) => {
  try {
    const jobId = getParamValue(req.params.jobId);
    const applicationId = getParamValue(req.params.applicationId);
    const organizationId = req.organization?.organizationId;

    if (!organizationId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (
      !jobId ||
      !applicationId ||
      !mongoose.isValidObjectId(jobId) ||
      !mongoose.isValidObjectId(applicationId)
    ) {
      return res.status(400).json({ success: false, message: 'Invalid ID formats' });
    }

    // applicationId is the JobCandidateAssignment ID
    const assignment = await JobCandidateAssignmentModel.findOne({
      _id: applicationId,
      jobId,
      organizationId,
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const candidateId = assignment.candidateId;

    const application = await findCandidateApplicationForAssignment({
      applicationId,
      jobId,
      candidateId,
      organizationId: String(organizationId),
    })
    if (application) {
      await application.populate('emails.sentBy', 'firstName lastName email profileImageUrl');
    }

    if (!application) {
      return res.status(404).json({ success: false, message: 'Candidate Application details not found' });
    }

    const sortedEmails = [...((application as any).emails || [])].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return res.status(200).json({
      success: true,
      emails: sortedEmails,
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
