// server/src/controllers/communicationController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma'; // Ensure this path is correct

// --- 1. GET ALL COMPLAINTS (Admin View) ---
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
            status: c.status,
            createdAt: c.createdAt
        }));

        return res.status(200).json(formatted);
    } catch (error) {
        console.error("Fetch Complaints Error:", error);
        return res.status(500).json({ message: "Failed to fetch grievances" });
    }
};

// --- 2. UPDATE COMPLAINT STATUS ---
export const updateComplaintStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await prisma.complaint.update({
            where: { id },
            data: { status }
        });

        return res.status(200).json({ message: "Status updated successfully", updated });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update complaint status" });
    }
};