import bcrypt from 'bcryptjs';
import User from '../users/user.model.js';
import { generateTokenPair, verifyRefreshToken } from '../../utils/jwt.js';
import { generateOTP, sendOTPEmail } from '../../utils/email.js';
import { BadRequestError, ConflictError, UnauthorizedError, NotFoundError } from '../../utils/errors.js';
export const signup = async (req, res, next) => {
  try {
    const {
      email,
      password
    } = req.body;
    const existingUser = await User.findOne({
      email
    });
    if (existingUser && existingUser.isVerified) {
      throw new ConflictError('Email already registered');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    if (existingUser && !existingUser.isVerified) {
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save();
    } else {
      await User.create({
        email,
        password: hashedPassword,
        otp,
        otpExpiry
      });
    }
    await sendOTPEmail(email, otp);
    res.status(201).json({
      success: true,
      message: 'Signup successful. Please verify your email with the OTP sent.'
    });
  } catch (error) {
    next(error);
  }
};
export const verifyOTP = async (req, res, next) => {
  try {
    const {
      email,
      otp
    } = req.body;
    const user = await User.findOne({
      email
    });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    if (user.isVerified) {
      throw new BadRequestError('Email already verified');
    }
    if (!user.otp || !user.otpExpiry) {
      throw new BadRequestError('No OTP found. Please request a new one.');
    }
    if (new Date() > user.otpExpiry) {
      throw new BadRequestError('OTP has expired. Please request a new one.');
    }
    if (user.otp !== otp) {
      throw new BadRequestError('Invalid OTP');
    }
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };
    const {
      accessToken,
      refreshToken
    } = generateTokenPair(tokenPayload);
    user.refreshToken = refreshToken;
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
export const login = async (req, res, next) => {
  try {
    const {
      email,
      password
    } = req.body;
    const user = await User.findOne({
      email
    });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }
    if (!user.isVerified) {
      // Resend OTP
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await sendOTPEmail(email, otp);
      res.status(403).json({
        success: false,
        message: 'Email not verified. A new OTP has been sent.',
        requiresVerification: true
      });
      return;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };
    const {
      accessToken,
      refreshToken
    } = generateTokenPair(tokenPayload);
    user.refreshToken = refreshToken;
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
export const refreshTokenHandler = async (req, res, next) => {
  try {
    const {
      refreshToken
    } = req.body;
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };
    const tokens = generateTokenPair(tokenPayload);

    // Token rotation
    user.refreshToken = tokens.refreshToken;
    await user.save();
    res.status(200).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Invalid or expired refresh token'));
    } else {
      next(error);
    }
  }
};
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -otp -otpExpiry -refreshToken');
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};