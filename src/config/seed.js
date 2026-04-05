import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User, { UserRole } from '../modules/users/user.model.js';
import Service from '../modules/services/service.model.js';
dotenv.config();
const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/allways');
    console.log('Connected to MongoDB');

    // Seed Admin
    const adminExists = await User.findOne({
      email: 'admin@allways.com'
    });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.create({
        email: 'admin@allways.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isVerified: true
      });
      console.log('✅ Admin user created: admin@allways.com / admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Seed Services
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany([{
        name: 'Home Cleaning',
        description: 'Professional home cleaning services including deep cleaning, regular maintenance, and move-in/move-out cleaning.',
        icon: '🧹',
        isActive: true,
        isComingSoon: false
      }, {
        name: 'AC Service',
        description: 'Expert AC servicing, repair, and installation. Includes gas refill, deep cleaning, and annual maintenance.',
        icon: '❄️',
        isActive: true,
        isComingSoon: false
      }, {
        name: 'Plumbing',
        description: 'Professional plumbing services for leaks, installations, drainage, and emergency repairs.',
        icon: '🔧',
        isActive: false,
        isComingSoon: true
      }, {
        name: 'Electrician',
        description: 'Certified electricians for wiring, repairs, installations, and electrical safety inspections.',
        icon: '⚡',
        isActive: false,
        isComingSoon: true
      }, {
        name: 'Painting',
        description: 'Interior and exterior painting services with premium quality paints and expert finish.',
        icon: '🎨',
        isActive: false,
        isComingSoon: true
      }, {
        name: 'Pest Control',
        description: 'Safe and effective pest control solutions for homes and offices. Includes termite treatment.',
        icon: '🐛',
        isActive: false,
        isComingSoon: true
      }]);
      console.log('✅ Default services seeded');
    } else {
      console.log('ℹ️  Services already exist');
    }
    console.log('🎉 Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};
seedDatabase();