import Service from './service.model.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
export const getAllServices = async (_req, res, next) => {
  try {
    const services = await Service.find().sort({
      position: 1,
      createdAt: -1
    });
    res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    next(error);
  }
};
export const getActiveServices = async (_req, res, next) => {
  try {
    const services = await Service.find({
      isActive: true,
      isComingSoon: false
    }).sort({
      position: 1,
      createdAt: -1
    });
    res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    next(error);
  }
};
export const createService = async (req, res, next) => {
  try {
    const {
      name,
      description,
      icon,
      isActive,
      isComingSoon,
      position
    } = req.body;
    const existing = await Service.findOne({
      name
    });
    if (existing) {
      throw new BadRequestError('Service with this name already exists');
    }
    const service = await Service.create({
      name,
      description,
      icon,
      isActive: isActive ?? true,
      isComingSoon: isComingSoon ?? false,
      position: position ?? 100
    });
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    next(error);
  }
};
export const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};
export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};