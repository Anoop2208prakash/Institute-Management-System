// server/src/controllers/communicationController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma'; 

/**
 * --- 1. GET ALL COMPLAINTS (Admin View) ---
 * Fetches all grievances with student details.
 */
export const getComplaints = async (req: Request, res: Response) => {
    try {
        const complaints = await prisma.complaint.findMany({
            include: { 
                student: {
                    select: {
                        fullName: true,
                        admissionNo: true
                    }
                } 
            },
            orderBy: { createdAt: 'desc' }
        });

        // Mapping to match the frontend "Complaint" interface
        const formatted = complaints.map((c) => ({
            id: c.id,
            studentName: c.student.fullName,
            admissionNo: c.student.admissionNo,
            subject: c.subject,
            category: c.category,
            // FIXED: Explicitly mapping description ensures the modal isn't empty
            description: c.description || "No detailed description provided.", 
            status: c.status,
            createdAt: c.createdAt
        }));

        return res.status(200).json(formatted);
    } catch (error) {
        console.error("Fetch Complaints Error:", error);
        return res.status(500).json({ message: "Failed to fetch grievances" });
    }
};

/**
 * --- 2. UPDATE COMPLAINT STATUS (Handles PATCH requests) ---
 * Updates status and returns the full object to sync frontend state.
 */
export const updateComplaintStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // 1. Validate status input
        const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        // 2. Ensure the ID exists before attempting update
        const existing = await prisma.complaint.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: "Complaint record not found" });
        }

        // 3. Perform the update
        const updated = await prisma.complaint.update({
            where: { id },
            data: { status },
            include: { 
                student: {
                    select: { fullName: true, admissionNo: true }
                }
            }
        });

        // 4. Return formatted data so frontend state can update immediately
        return res.status(200).json({ 
            message: "Status updated successfully", 
            complaint: {
                id: updated.id,
                studentName: updated.student.fullName,
                admissionNo: updated.student.admissionNo,
                subject: updated.subject,
                category: updated.category,
                description: updated.description || "No detailed description provided.",
                status: updated.status,
                createdAt: updated.createdAt
            }
        });
    } catch (error) {
        console.error("Update Status Error:", error); 
        return res.status(500).json({ message: "Failed to update complaint status" });
    }
};