import { Recruitment } from "../models/Recruitment.model.js"
import { Applicant } from "../models/Applicant.model.js"

export const HandleCreateRecruitment = async (req, res) => {
    try {
        const { jobtitle, description } = req.body

        if (!jobtitle || !description) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const recruitment = await Recruitment.findOne({ jobtitle: jobtitle, organizationID: req.ORGID })

        if (recruitment) {
            return res.status(409).json({ success: false, message: "Recruitment already exists for this job title" })
        }

        const newRecruitment = await Recruitment.create({
            jobtitle,
            description,
            organizationID: req.ORGID
        })

        return res.json({ success: true, message: "Recruitment created successfully", data: newRecruitment })

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const HandleAllRecruitments = async (req, res) => {
    try {
        const recruitments = await Recruitment.find({ organizationID: req.ORGID }).populate("application")
        return res.status(200).json({ success: true, message: "All recruitments retrieved successfully", data: recruitments })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

export const HandleRecruitment = async (req, res) => {
    try {
        const { recruitmentID } = req.params

        if (!recruitmentID) {
            return res.status(400).json({ success: false, message: "Recruitment ID is required" })
        }

        const recruitment = await Recruitment.findOne({ _id: recruitmentID, organizationID: req.ORGID }).populate("application")
        return res.status(200).json({ success: true, message: "Recruitment retrieved successfully", data: recruitment })
    } catch (error) {
        return res.status(404).json({ success: false, message: "Recruitment not found" })
    }
}

export const HandleUpdateRecruitment = async (req, res) => {
    try {
        const { recruitmentID } = req.params; 
        const { jobtitle, description, departmentID, applicationIDArray } = req.body

        if (!recruitmentID) {
            return res.status(400).json({ success: false, message: "Recruitment ID is required in URL parameters" })
        }

        const recruitment = await Recruitment.findOne({ _id: recruitmentID, organizationID: req.ORGID })

        if (!recruitment) {
            return res.status(404).json({ success: false, message: "Recruitment not found" })
        }

        let updateData = {};
        if (jobtitle) updateData.jobtitle = jobtitle;
        if (description) updateData.description = description;
        if (departmentID) updateData.department = departmentID;

        if (Object.keys(updateData).length > 0) {
            Object.assign(recruitment, updateData);
        }

        let addedApplicants = [];
        let alreadyPresentApplicants = [];

        if (applicationIDArray && Array.isArray(applicationIDArray)) {
            const currentApplicants = recruitment.application.map(id => id.toString());

            for (const applicantId of applicationIDArray) {
                if (!currentApplicants.includes(applicantId)) {
                    recruitment.application.push(applicantId);
                    addedApplicants.push(applicantId);
                } else {
                    alreadyPresentApplicants.push(applicantId);
                }
            }
        }

        if (Object.keys(updateData).length > 0 || addedApplicants.length > 0) {
            const updatedRecruitment = await recruitment.save();
            return res.status(200).json({
                success: true,
                message: `Recruitment updated successfully. ${addedApplicants.length} applicants added. ${alreadyPresentApplicants.length} applicants already present.`, 
                data: updatedRecruitment,
                addedApplicants,
                alreadyPresentApplicants
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "No changes applied. Provide details to update or new applicant IDs to add.",
                data: recruitment,
                addedApplicants,
                alreadyPresentApplicants
            });
        }

    } catch (error) {
        console.error("Update Recruitment Error:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: "Invalid Recruitment ID format" });
        }
        return res.status(500).json({ success: false, message: "Internal server error during recruitment update." })
    }
}

export const HandleDeleteRecruitment = async (req, res) => {
    try {
        const { recruitmentID } = req.params

        const recruitment = await Recruitment.findByIdAndDelete(recruitmentID)

        if (!recruitment) {
            return res.status(404).json({ success: false, message: "Recruitment not found" })
        }

        return res.status(200).json({ success: true, message: "Recruitment deleted successfully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}