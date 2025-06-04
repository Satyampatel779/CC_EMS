import express from 'express';
import { Organization } from '../models/Organization.model.js';
import { VerifyhHRToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /api/v1/organization/info - Get organization info
router.get('/info', VerifyhHRToken, async (req, res) => {
    try {
        // Get organization by ID from the authenticated user's ORGID
        const organization = await Organization.findById(req.ORGID);
        
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }        // Return organization info (excluding sensitive fields if any)
        const organizationInfo = {
            _id: organization._id,
            name: organization.name,
            description: organization.description,
            OrganizationURL: organization.OrganizationURL,
            OrganizationMail: organization.OrganizationMail,
            policies: organization.policies || "",
            createdAt: organization.createdAt,
            updatedAt: organization.updatedAt
        };

        return res.status(200).json({
            success: true,
            data: organizationInfo,
            message: 'Organization info retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching organization info:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// PUT /api/v1/organization/update - Update organization info
router.put('/update', VerifyhHRToken, async (req, res) => {
    try {
        const { name, description, OrganizationURL, OrganizationMail, policies } = req.body;
        
        // Get organization by ID from the authenticated user's ORGID
        const organization = await Organization.findById(req.ORGID);
        
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found'
            });
        }        // Update fields if provided
        if (name !== undefined) organization.name = name;
        if (description !== undefined) organization.description = description;
        if (OrganizationURL !== undefined) organization.OrganizationURL = OrganizationURL;
        if (OrganizationMail !== undefined) organization.OrganizationMail = OrganizationMail;
        if (policies !== undefined) organization.policies = policies;
        
        await organization.save();        // Return updated organization info
        const organizationInfo = {
            _id: organization._id,
            name: organization.name,
            description: organization.description,
            OrganizationURL: organization.OrganizationURL,
            OrganizationMail: organization.OrganizationMail,
            policies: organization.policies || "",
            createdAt: organization.createdAt,
            updatedAt: organization.updatedAt
        };

        return res.status(200).json({
            success: true,
            data: organizationInfo,
            message: 'Organization info updated successfully'
        });
    } catch (error) {
        console.error('Error updating organization info:', error);
        
        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                success: false,
                message: `${field} already exists. Please use a different value.`
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;
