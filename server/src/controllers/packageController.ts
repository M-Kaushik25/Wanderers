import { Request, Response } from 'express';
import prisma from '../models/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

// Get all packages (Public/Tourist)
export const getPackages = async (req: Request, res: Response) => {
  try {
    const packages = await prisma.package.findMany({
      include: {
        company: {
          select: { name: true, isVerified: true }
        }
      }
    });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
};

// Get package by ID
export const getPackageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pkg = await prisma.package.findUnique({
      where: { id: Number(id) },
      include: {
        company: { select: { name: true, isVerified: true } },
        reviews: true
      }
    });
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch package' });
  }
};

// Create a new package (OPERATOR only)
export const createPackage = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, destination, durationDays, price, itinerary, coverImage } = req.body;

    let company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (!company) {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      company = await prisma.company.create({
        data: {
          userId: req.user.id,
          name: `${user?.name || 'Verified'}'s Tour Agency`,
          description: 'Tour Company registered on Wanderers',
          isVerified: true
        }
      });
    }

    const newPackage = await prisma.package.create({
      data: {
        title,
        description,
        destination,
        durationDays,
        price,
        itinerary,
        coverImage,
        companyId: company.id
      }
    });

    res.status(201).json(newPackage);
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ error: 'Failed to create package' });
  }
};

// Update package (OPERATOR only)
export const updatePackage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (!company) return res.status(403).json({ error: 'No company profile found' });

    const pkg = await prisma.package.findUnique({ where: { id: Number(id) } });
    if (!pkg || pkg.companyId !== company.id) {
      return res.status(403).json({ error: 'Unauthorized to edit this package' });
    }

    const updatedPackage = await prisma.package.update({
      where: { id: Number(id) },
      data
    });

    res.json(updatedPackage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update package' });
  }
};

// Delete package (OPERATOR only)
export const deletePackage = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const company = await prisma.company.findUnique({ where: { userId: req.user.id } });
    if (!company) return res.status(403).json({ error: 'No company profile found' });

    const pkg = await prisma.package.findUnique({ where: { id: Number(id) } });
    if (!pkg || pkg.companyId !== company.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this package' });
    }

    await prisma.package.delete({ where: { id: Number(id) } });
    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete package' });
  }
};
