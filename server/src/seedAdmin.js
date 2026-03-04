import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGO_URI || "mongodb+srv://alanwaelmashaly22_db_user:ZSv9459Vnzu4Yi8s@motionforge.vvcsa5t.mongodb.net/?appName=motionforge";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function createAdmin() {
  try {
    await client.connect();
    
    const db = client.db('motionforge');
    const usersCollection = db.collection('users');
    
    // Check if admin exists
    const existingAdmin = await usersCollection.findOne({ email: 'admin@motionforge.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin account already exists!');
      await client.close();
      process.exit(0);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const adminUser = {
      name: 'Admin',
      email: 'admin@motionforge.com',
      password: hashedPassword,
      plan: 'agency',
      projectLimit: 999999,
      exportLimit: 999999,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await usersCollection.insertOne(adminUser);
    console.log('✅ Admin account created successfully!');
    console.log('   Email: admin@motionforge.com');
    console.log('   Password: admin123');
    console.log('   Plan: agency');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await client.close();
  }
}

createAdmin();
