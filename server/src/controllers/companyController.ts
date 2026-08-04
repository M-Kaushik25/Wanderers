import { Request, Response } from 'express';
import prisma from '../models/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

// Create company profile (OPERATOR)
export const createCompany = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, gstNumber, licenseUrl } = req.body;

    const existing = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (existing) return res.status(400).json({ error: 'Company profile already exists' });

    const company = await prisma.company.create({
      data: {
        userId: req.user.id,
        name,
        description,
        gstNumber,
        licenseUrl,
        isVerified: false
      }
    });

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create company profile' });
  }
};

// Get my company (OPERATOR)
export const getMyCompany = async (req: AuthRequest, res: Response) => {
  try {
    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company profile' });
  }
};

// Get all companies (ADMIN)
export const getAllCompanies = async (req: AuthRequest, res: Response) => {
  try {
    const companies = await prisma.company.findMany({
      include: {
        user: { select: { name: true, email: true } },
        packages: { select: { id: true } }
      }
    });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

// Verify company (ADMIN)
export const verifyCompany = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const updated = await prisma.company.update({
      where: { id: Number(id) },
      data: { isVerified }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify company' });
  }
};
