import { Request,Response } from "express";
import mongoose from "mongoose";
import { getParamValue } from '../utils/ParamValue.js'
import UserModel from "../models/UserModel.js";
import JobsModel from "../models/JobsModel.js";
import { applicationFormSchema } from "../validations/applicationFormSchemas.js";
import {
  canManageOrganizationRecruitingData,
  getAccessibleJobFilterForUser,
} from "./helpers/controllerUtils.js";


const getApplicationForm = async (req:Request,res:Response)=>{
  
    try {
        const userId = req.user?.id;
        if(!userId){
            return res.status(401).json({success:false,message:"Unauthorized"})
        }

        const jobId = getParamValue(req.params.jobId);

        if(!jobId || !mongoose.isValidObjectId(jobId)){
            return res.status(400).json({success:false,message:"Invalid job id"})
        }

        const user = await UserModel.findById(userId).select("organizationId");
        const organizationId = user?.organizationId;

        if(!organizationId){
            return res.status(400).json({success:false,message:"Organization is required to fetch application form"})
        }

        const job = await JobsModel.findOne({
            ...(await getAccessibleJobFilterForUser(userId, String(organizationId))),
            _id: jobId,
        }).select("applicationForm");

        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        // If applicationForm is null or undefined, return a default structure
        if (!job.applicationForm) {
            return res.status(200).json({
                success: true,
                applicationForm: {
                    basicInfo: { phone: "Hidden", location: "Hidden" },
                    links: [],
                    fileUploads: [],
                    customQuestions: []
                }
            });
        }

        return res.status(200).json({ success: true, applicationForm: job.applicationForm });

    }
    catch(error){
        console.error("Error fetching application form:",error);
        return res.status(500).json({success:false,message:"Server error"});
    }
}

const updateApplicationForm = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const jobId = getParamValue(req.params.jobId);

    if (!jobId || !mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job id",
      });
    }

    const user = await UserModel.findById(userId)
      .select("organizationId");

    const organizationId = user?.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization is required",
      });
    }

    if (!(await canManageOrganizationRecruitingData(userId, String(organizationId)))) {
      return res.status(403).json({
        success: false,
        message: "Only admins and recruiters can update application forms",
      });
    }

    const job = await JobsModel.findOne({
      _id: jobId,
      organizationId,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }


    const applicationForm = req.body.applicationForm;


  const parsedBody = applicationFormSchema.safeParse(applicationForm);

  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      message: parsedBody.error.issues[0].message,
    });
  }

  job.applicationForm = parsedBody.data;


  await job.save();

    return res.status(200).json({
      success: true,
      message: "Application form updated successfully",
      applicationForm: job.applicationForm,
    });

  } catch (error) {
    console.error(
      "Error updating application form:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export {getApplicationForm, updateApplicationForm};
