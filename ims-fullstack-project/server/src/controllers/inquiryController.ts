// server/src/controllers/inquiryController.ts
import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// ------------------------------------------
// 1. CREATE INQUIRY (Public)
// ------------------------------------------
export const createInquiry = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, course, message } = req.body;

    if (!fullName || !email || !phone || !message) {
        return res.status(400).json({ message: "All fields are required" });
    }

    await prisma.inquiry.create({
        data: { fullName, email, phone, course, message }
    });

    res.status(201).json({ message: "Inquiry sent successfully! We will contact you soon." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to send inquiry" });
  }
};

// ------------------------------------------
// 2. GET INQUIRIES (Admin Only)
// ------------------------------------------
export const getInquiries = async (req: Request, res: Response) => {
    try {
        const inquiries = await prisma.inquiry.findMany({ orderBy: { date: 'desc' } });
        res.json(inquiries);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch inquiries" });
    }
};

// ------------------------------------------
// 3. UPDATE STATUS (Mark as Contacted)
// ------------------------------------------
export const updateInquiryStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // e.g. "CONTACTED"

        const updated = await prisma.inquiry.update({
            where: { id },
            data: { status }
        });
        res.json(updated);
    } catch (e) {
        console.error("Update Status Error:", e);
        res.status(500).json({ error: "Failed to update status" });
    }
};

// ------------------------------------------
// 4. DELETE INQUIRY
// ------------------------------------------
export const deleteInquiry = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.inquiry.delete({ where: { id } });
        res.json({ message: "Inquiry deleted successfully" });
    } catch (e) {
        console.error("Delete Inquiry Error:", e);
        res.status(500).json({ error: "Failed to delete inquiry" });
    }
};