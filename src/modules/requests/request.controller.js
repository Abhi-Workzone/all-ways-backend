import RequestModel, { RequestStatus } from './request.model.js';
import Service from '../services/service.model.js';
import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import { UserRole } from '../users/user.model.js';
export const createRequest = async (req, res, next) => {
  try {
    const {
      serviceId,
      address,
      description,
      preferredTime
    } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    if (!service.isActive || service.isComingSoon) {
      throw new BadRequestError('This service is not currently available');
    }
    const serviceRequest = await RequestModel.create({
      userId: req.user.userId,
      serviceId,
      address,
      description,
      preferredTime: new Date(preferredTime),
      logs: [{
        updatedBy: req.user.userId,
        role: req.user.role,
        fromStatus: 'NONE',
        toStatus: RequestStatus.REQUESTED
      }]
    });
    const populated = await serviceRequest.populate('serviceId', 'name icon');
    res.status(201).json({
      success: true,
      message: 'Service request created successfully',
      data: populated
    });
  } catch (error) {
    next(error);
  }
};
export const getRequests = async (req, res, next) => {
  try {
    const filter = {};

    // If user role, only show their requests
    if (req.user.role === UserRole.USER) {
      filter.userId = req.user.userId;
    }

    // If vendor role, show requests where they are assigned
    if (req.user.role === UserRole.VENDOR) {
      filter.vendorId = req.user.userId;
    }

    // Optional status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Add logic to hide vendor details from user until 1hr before
    const requests = await RequestModel.find(filter)
      .populate('serviceId', 'name icon')
      .populate('userId', 'email fullName phoneNumber')
      .populate('vendorId', 'email fullName businessName phoneNumber businessAddress businessManualAddress')
      .select('+latitude +longitude')
      .sort({ createdAt: -1 });

    // Post-process to synchronize vendor privacy with real-time operational state
    const processed = requests.map(reqRaw => {
        const r = reqRaw.toObject();
        if (req.user.role === UserRole.USER && r.vendorId) {
            const now = new Date();
            const preferred = new Date(r.preferredTime);
            const oneHourInMs = 60 * 60 * 1000;
            const isSoon = preferred.getTime() - now.getTime() <= oneHourInMs;

            const activeStatuses = ['ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'];
            
            // SECURITY PROTOCOL:
            // 1. If mission is COMPLETED -> Shield sensitive metadata
            // 2. If mission is in ACTIVE flow -> Maximum transparency for coordination
            // 3. Otherwise -> Use 1-hour "Soon" temporal guardrail
            let shouldHide = false;
            
            if (r.status === 'COMPLETED') {
                shouldHide = true;
            } else if (activeStatuses.includes(r.status)) {
                shouldHide = false;
            } else if (!isSoon) {
                shouldHide = true;
            }

            if (shouldHide) {
                // Return ONLY non-sensitive operational identifier
                r.vendorId = {
                    _id: r.vendorId._id,
                    businessName: r.vendorId.businessName
                    // Protected fields: email, fullName, phoneNumber, businessAddress...
                };
            }
        }
        return r;
    });

    res.status(200).json({
      success: true,
      data: processed
    });
  } catch (error) {
    next(error);
  }
};
export const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await RequestModel.findById(req.params.id);
    
    if (!request) throw new NotFoundError('Request not found');

    // Requirement: No updates after completion
    if (request.status === RequestStatus.COMPLETED) {
       throw new BadRequestError('Cannot update request after it has been completed');
    }

    const previousStatus = request.status;

    // Security: Only assigned vendor can accept/reject or change to progress/complete
    if (req.user.role === UserRole.VENDOR && request.vendorId?.toString() !== req.user.userId) {
       throw new BadRequestError('Service not assigned to you');
    }

    // Rejection logic for vendor
    if (req.user.role === UserRole.VENDOR && status === 'REJECTED') {
      request.rejectedVendors.push(req.user.userId);
      request.vendorId = null;
      request.status = RequestStatus.REQUESTED;
      request.logs.push({
        updatedBy: req.user.userId,
        role: req.user.role,
        fromStatus: previousStatus,
        toStatus: 'REJECTED'
      });
    } else {
      request.status = status;
      request.logs.push({
        updatedBy: req.user.userId,
        role: req.user.role,
        fromStatus: previousStatus,
        toStatus: status
      });
    }

    await request.save();
    
    const populated = await RequestModel.findById(request._id)
      .populate('serviceId', 'name icon')
      .populate('userId', 'email')
      .populate('vendorId', 'email businessName');

    res.status(200).json({
      success: true,
      data: populated
    });
  } catch (error) {
    next(error);
  }
};

export const assignVendor = async (req, res, next) => {
   try {
     const { vendorId } = req.body;
     const request = await RequestModel.findById(req.params.id);
     
     if (!request) throw new NotFoundError('Request not found');
     
     const previousStatus = request.status;
     request.vendorId = vendorId;
     request.status = RequestStatus.ASSIGNED;
     request.logs.push({
        updatedBy: req.user.userId,
        role: req.user.role,
        fromStatus: previousStatus,
        toStatus: RequestStatus.ASSIGNED
     });
     await request.save();

     res.status(200).json({
       success: true,
       message: 'Vendor assigned successfully',
       data: request
     });
   } catch (error) {
     next(error);
   }
};

export const getVendorsForService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const User = (await import('../users/user.model.js')).default;
    
    // Find only APPROVED vendors who provide this service
    const vendors = await User.find({
       role: UserRole.VENDOR,
       businessStatus: 'APPROVED',
       providedServices: { $in: [serviceId] }
    }).select('fullName businessName email phoneNumber mapAddress businessLocation businessManualAddress');

    res.status(200).json({
       success: true,
       data: vendors
    });
  } catch (error) {
    next(error);
  }
};

export const confirmArrival = async (req, res, next) => {
  try {
    const request = await RequestModel.findById(req.params.id);
    if (!request) throw new NotFoundError('Request not found');
    
    if (request.userId.toString() !== req.user.userId) {
       throw new BadRequestError('Only the customer can confirm arrival');
    }

    if (request.status !== RequestStatus.ARRIVED) {
       throw new BadRequestError('Vendor has not marked as arrived yet');
    }

    const previousStatus = request.status;
    request.status = RequestStatus.IN_PROGRESS;
    request.logs.push({
        updatedBy: req.user.userId,
        role: req.user.role,
        fromStatus: previousStatus,
        toStatus: RequestStatus.IN_PROGRESS
    });
    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const startWork = async (req, res, next) => {
  try {
    const images = req.processedImages || req.body.images;
    const request = await RequestModel.findById(req.params.id);
    if (!request) throw new NotFoundError('Request not found');

    if (request.vendorId?.toString() !== req.user.userId) {
       throw new BadRequestError('Not assigned to you');
    }

    request.beforeImages = images || [];
    request.logs.push({
        updatedBy: req.user.userId,
        role: req.user.role,
        fromStatus: request.status,
        toStatus: request.status
    });
    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const completeRequest = async (req, res, next) => {
  try {
    const images = req.processedImages || req.body.images;
    const request = await RequestModel.findById(req.params.id);
    if (!request) throw new NotFoundError('Request not found');

    if (request.vendorId?.toString() !== req.user.userId) {
       throw new BadRequestError('Not assigned to you');
    }

    if (request.status !== RequestStatus.IN_PROGRESS) {
       throw new BadRequestError('Service must be in progress to complete');
    }

    if (!images || images.length === 0) {
       throw new BadRequestError('After images are required for completion');
    }

    const previousStatus = request.status;
    request.afterImages = images;
    request.status = RequestStatus.COMPLETED;
    request.logs.push({
        updatedBy: req.user.userId,
        role: req.user.role,
        fromStatus: previousStatus,
        toStatus: RequestStatus.COMPLETED
    });
    await request.save();

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const adminCreateRequest = async (req, res, next) => {
  try {
    const { userEmail, serviceId, address, description, preferredTime } = req.body;
    
    // Lazy load User model to avoid circular dependency
    const User = (await import('../users/user.model.js')).default;
    const targetUser = await User.findOne({ email: userEmail, role: UserRole.USER });
    
    if (!targetUser) {
      throw new NotFoundError('Client email not found in registry');
    }

    const service = await Service.findById(serviceId);
    if (!service) throw new NotFoundError('Service vector not found');

    const serviceRequest = await RequestModel.create({
      userId: targetUser._id,
      serviceId,
      address,
      description,
      preferredTime: new Date(preferredTime),
      logs: [{
        updatedBy: req.user.userId,
        role: UserRole.ADMIN,
        fromStatus: 'NONE',
        toStatus: RequestStatus.REQUESTED,
        timestamp: new Date()
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Proxy service booking initiated',
      data: serviceRequest
    });
  } catch (error) {
    next(error);
  }
};