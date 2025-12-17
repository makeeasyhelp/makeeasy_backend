const bcrypt = require('bcryptjs');

/**
 * Creates initial seed data for the database
 * Enhanced to work in production environments
 * @param {Object} mongoose - Mongoose instance
 */
const seedDatabase = async (mongoose) => {
  try {
    // Check if we need to run the seeder in production
    const forceSeed = process.env.FORCE_DB_SEED === 'true';
    
    // Skip seeding in production unless forced
    if (process.env.NODE_ENV === 'production' && !forceSeed) {
      console.log('Skipping database seeding in production. Set FORCE_DB_SEED=true to override.');
      return;
    }
    
    // Ensure mongoose is connected
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      console.log('Mongoose not connected. Cannot seed database.');
      return;
    }
    
    console.log('Starting database seed process...');
    
    // Make sure models are registered
    let User, Category, Product, Service, Banner, Location;
    
    try {
      User = mongoose.model('User');
      Category = mongoose.model('Category');
      Product = mongoose.model('Product');
      Service = mongoose.model('Service');
      Banner = mongoose.model('Banner');
      Location = mongoose.model('Location');
    } catch (err) {
      console.error('Error loading models for seeding:', err.message);
      return;
    }
    
    console.log('Models loaded successfully. Checking for existing data...');
    
    // Only seed if collections are empty
    const userCount = await User.countDocuments();
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();
    const serviceCount = await Service.countDocuments();
    const bannerCount = await Banner.countDocuments();
    const locationCount = await Location.countDocuments();
    
    console.log(`Current counts - Users: ${userCount}, Categories: ${categoryCount}, Products: ${productCount}, Services: ${serviceCount}, Banners: ${bannerCount}, Locations: ${locationCount}`);
    
    if (userCount > 0 && categoryCount > 0 && productCount > 0 && serviceCount > 0 && bannerCount > 0 && locationCount > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }
    
    console.log('Seeding database...');
    
    // Create admin user if none exist
    if (userCount === 0) {
      try {
        await User.create({
          name: 'Admin User',
          email: 'admin@makeeasy.com',
          password: 'admin123',
          role: 'admin'
        });
        
        await User.create({
          name: 'Regular User',
          email: 'user@makeeasy.com',
          password: 'user123',
          role: 'user'
        });
        
        console.log('Users seeded successfully');
      } catch (err) {
        console.error('Error seeding users:', err);
      }
    }
    
    // Create categories if none exist
    if (categoryCount === 0) {
      try {
        await Category.create([
          { id: 1, name: "Electronics", icon: "Tv", path: "electronics", key: "electronics" },
          { id: 2, name: "Furniture", icon: "Sofa", path: "furniture", key: "furniture" },
          { id: 3, name: "Vehicles", icon: "Car", path: "vehicles", key: "vehicles" },
          { id: 4, name: "Construction", icon: "Building", path: "construction", key: "construction" },
          { id: 5, name: "Home Services", icon: "Home", path: "home-services", key: "home-services" },
          { id: 6, name: "Professional Services", icon: "Briefcase", path: "professional", key: "professional" }
        ]);
        
        console.log('Categories seeded successfully');
      } catch (err) {
        console.error('Error seeding categories:', err);
      }
    }
    
    // Create products if none exist
    if (productCount === 0) {
      try {
        await Product.create([
          { id: 18, title: "House Construction", price: 1999, location: "Kanpur", category: "construction" },
          { id: 1, title: "Geyser", price: 499, location: "Kanpur", category: "electronics" },
          { id: 2, title: "Smart TV", price: 499, location: "Kanpur", category: "electronics" },
          { id: 3, title: "Washing Machine", price: 499, location: "Kanpur", category: "electronics" },
          { id: 4, title: "AC", price: 599, location: "Kanpur", category: "electronics" },
          { id: 5, title: "Microwave Oven", price: 599, location: "Kanpur", category: "electronics" },
          { id: 6, title: "Refrigerator", price: 499, location: "Kanpur", category: "electronics" },
          { id: 7, title: "Wooden Sofa Set", price: 599, location: "Kanpur", category: "furniture" },
          { id: 8, title: "Office Chair", price: 249, location: "Kanpur", category: "furniture" },
          { id: 9, title: "Dining Table", price: 499, location: "Kanpur", category: "furniture" },
          { id: 10, title: "Car", price: 999, location: "Kanpur", category: "vehicles" },
          { id: 11, title: "Bike", price: 449, location: "Kanpur", category: "vehicles" },
          { id: 12, title: "Drill Machine", price: 200, location: "Kanpur", category: "construction" },
          { id: 13, title: "Cement Mixer", price: 800, location: "Kanpur", category: "construction" },
          { id: 14, title: "Deep Cleaning Service", price: 1099, location: "Kanpur", category: "home-services" },
          { id: 15, title: "Pest Control", price: 799, location: "Kanpur", category: "home-services" },
          { id: 16, title: "Legal Consultation", price: 599, location: "Online", category: "professional" },
          { id: 17, title: "CA Services", price: 599, location: "Delhi", category: "professional" }
        ]);
        
        console.log('Products seeded successfully');
      } catch (err) {
        console.error('Error seeding products:', err);
      }
    }
    
    // Create services if none exist
    if (serviceCount === 0) {
      try {
        await Service.create([
          { title: "Plumbing Services", description: "Professional plumbing solutions for all your water and drainage needs.", icon: "Droplet", price: 299 },
          { title: "Electrical Services", description: "Complete electrical solutions from certified electricians.", icon: "Zap", price: 399 },
          { title: "Home Painting", description: "Transform your space with our professional painting services.", icon: "PaintBucket", price: 899 },
          { title: "House Construction", description: "Turn your dream house into reality with our construction experts.", icon: "Building", price: 1999 },
          { title: "Interior Design", description: "Get professional interior design services for your home or office.", icon: "Palette", price: 799 },
          { title: "AC Repair", description: "Fast and reliable air conditioner repair and maintenance services.", icon: "Wind", price: 349 },
          { title: "Cleaning Services", description: "Professional home and office cleaning services.", icon: "Sparkles", price: 499 },
          { title: "Pest Control", description: "Effective pest control solutions for your home and business.", icon: "Bug", price: 599 }
        ]);
        
        console.log('Services seeded successfully');
      } catch (err) {
        console.error('Error seeding services:', err);
      }
    }

    //Create data for About Us page if not exists
    const About = mongoose.model('About');
    const aboutCount = await About.countDocuments();
    if (aboutCount === 0) {
      try {
        await About.create({
          mission: {
            title: "Our Mission",
            subtitle: "Simplifying your life through seamless service delivery",
            logoUrl: ""
          },
          story: {
            heading: "Our Story",
            description: "Welcome to MakeEasy, your trusted platform for buying, selling, and availing services with ease. Our mission is to simplify your life by providing a seamless experience for all your needs. Whether you're looking to purchase quality products, sell your items, or hire professional services, MakeEasy is here to help you every step of the way.",
            highlights: {
              customers: "10,000+",
              providers: "500+",
              cities: "15+"
            }
          },
          coreValues: [
            {
              title: "Customer First",
              description: "We prioritize our customers' needs and satisfaction above everything else."
            },
            {
              title: "Quality Service",
              description: "We ensure all our service providers meet the highest standards of quality."
            },
            {
              title: "Trust & Reliability",
              description: "Building lasting relationships through transparency and dependable service."
            }
          ],
          leadershipTeam: [
            {
              name: "John Doe",
              role: "CEO & Founder",
              bio: "Visionary leader with 15+ years of experience in technology and service industries.",
              imageUrl: "",
              socials: {
                linkedin: "",
                twitter: "",
                facebook: ""
              }
            }
          ],
          blog: [
            {
              category: "Company News",
              date: new Date("2024-01-15"),
              title: "Welcome to MakeEasy",
              description: "Introducing our platform that makes finding and booking services easier than ever.",
              link: "/blog/welcome-to-makeeasy"
            }
          ],
          journey: [
            {
              year: "2024",
              description: "MakeEasy platform launched, revolutionizing the service booking experience."
            },
            {
              year: "2023",
              description: "Company founded with the vision to simplify service discovery and booking."
            }
          ],
          community: {
            heading: "Join the MakeEasy Community",
            description: "Be part of our growing community of customers and service providers.",
            buttons: [
              {
                text: "Join as Customer",
                link: "/register/customer"
              },
              {
                text: "Join as Provider",
                link: "/register/provider"
              }
            ]
          }
        });
        console.log('About Us content seeded successfully');
      } catch (err) {
        console.error('Error seeding About Us content:', err);
      }
    }

    // Create banners if none exist
    if (bannerCount === 0) {
      try {
        await Banner.create([
          {
            title: "Welcome to MakeEasy",
            subtitle: "Rent Anything, Book Any Service",
            description: "Your one-stop marketplace for rentals and services. Find quality products and professional services at your fingertips.",
            image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1200&h=600&fit=crop",
            link: "/products",
            buttonText: "Explore Products",
            isActive: true,
            displayOrder: 1
          },
          {
            title: "Quality Furniture Rentals",
            subtitle: "Transform Your Space",
            description: "Premium furniture rentals for homes and offices. Flexible plans to suit your needs.",
            image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&h=600&fit=crop",
            link: "/products?category=furniture",
            buttonText: "Browse Furniture",
            isActive: true,
            displayOrder: 2
          },
          {
            title: "Professional Services",
            subtitle: "Expert Help When You Need It",
            description: "Book trusted professionals for home services, repairs, and more. Quality service guaranteed.",
            image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=600&fit=crop",
            link: "/services",
            buttonText: "View Services",
            isActive: true,
            displayOrder: 3
          },
          {
            title: "Latest Electronics",
            subtitle: "Stay Connected with Premium Tech",
            description: "Rent the latest electronics, from laptops to home appliances. Affordable monthly plans available.",
            image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=600&fit=crop",
            link: "/products?category=electronics",
            buttonText: "Shop Electronics",
            isActive: true,
            displayOrder: 4
          }
        ]);
        
        console.log('Banners seeded successfully');
      } catch (err) {
        console.error('Error seeding banners:', err);
      }
    }

    // Create locations if none exist
    if (locationCount === 0) {
      try {
        await Location.create([
          // Maharashtra
          { city: "Mumbai", district: "Mumbai", state: "Maharashtra", icon: "Building2", isActive: true, displayOrder: 1 },
          { city: "Pune", district: "Pune", state: "Maharashtra", icon: "Building", isActive: true, displayOrder: 2 },
          { city: "Nagpur", district: "Nagpur", state: "Maharashtra", icon: "MapPin", isActive: true, displayOrder: 3 },
          
          // Delhi NCR
          { city: "New Delhi", district: "New Delhi", state: "Delhi", icon: "Landmark", isActive: true, displayOrder: 4 },
          { city: "Gurgaon", district: "Gurugram", state: "Haryana", icon: "Building2", isActive: true, displayOrder: 5 },
          { city: "Noida", district: "Gautam Buddha Nagar", state: "Uttar Pradesh", icon: "Building", isActive: true, displayOrder: 6 },
          
          // Karnataka
          { city: "Bangalore", district: "Bengaluru Urban", state: "Karnataka", icon: "Building2", isActive: true, displayOrder: 7 },
          { city: "Mysore", district: "Mysuru", state: "Karnataka", icon: "Castle", isActive: true, displayOrder: 8, isNew: true },
          
          // Telangana
          { city: "Hyderabad", district: "Hyderabad", state: "Telangana", icon: "Building", isActive: true, displayOrder: 9 },
          
          // Tamil Nadu
          { city: "Chennai", district: "Chennai", state: "Tamil Nadu", icon: "Building2", isActive: true, displayOrder: 10 },
          
          // Gujarat
          { city: "Ahmedabad", district: "Ahmedabad", state: "Gujarat", icon: "Building", isActive: true, displayOrder: 11 },
          
          // Rajasthan
          { city: "Jaipur", district: "Jaipur", state: "Rajasthan", icon: "Castle", isActive: true, displayOrder: 12 },
          
          // Uttar Pradesh
          { city: "Lucknow", district: "Lucknow", state: "Uttar Pradesh", icon: "Landmark", isActive: true, displayOrder: 13, isNew: true },
          { city: "Faridabad", district: "Faridabad", state: "Haryana", icon: "MapPin", isActive: true, displayOrder: 14 },
          { city: "Ghaziabad", district: "Ghaziabad", state: "Uttar Pradesh", icon: "Building", isActive: true, displayOrder: 15 },
          { city: "Gandhinagar", district: "Gandhinagar", state: "Gujarat", icon: "Building2", isActive: true, displayOrder: 16 },
          
          // Union Territories & Other States
          { city: "Chandigarh", district: "Chandigarh", state: "Chandigarh", icon: "Building", isActive: true, displayOrder: 17 },
          
          // West Bengal
          { city: "Kolkata", district: "Kolkata", state: "West Bengal", icon: "Building2", isActive: true, displayOrder: 18, isNew: true },
          
          // Madhya Pradesh
          { city: "Indore", district: "Indore", state: "Madhya Pradesh", icon: "MapPin", isActive: true, displayOrder: 19, isNew: true },
          
          // Kerala
          { city: "Kochi", district: "Ernakulam", state: "Kerala", icon: "Anchor", isActive: true, displayOrder: 20, isNew: true },
          
          // Uttarakhand
          { city: "Hosur", district: "Krishnagiri", state: "Tamil Nadu", icon: "MapPin", isActive: true, displayOrder: 21, isNew: true },
          
          // Pondicherry
          { city: "Pondicherry", district: "Pondicherry", state: "Puducherry", icon: "Palmtree", isActive: true, displayOrder: 22, isNew: true },
          
          // Himachal Pradesh
          { city: "Visakhapatnam", district: "Visakhapatnam", state: "Andhra Pradesh", icon: "Ship", isActive: true, displayOrder: 23, isNew: true },
          
          // Tamil Nadu
          { city: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu", icon: "Factory", isActive: true, displayOrder: 24, isNew: true }
        ]);
        
        console.log('Locations seeded successfully');
      } catch (err) {
        console.error('Error seeding locations:', err);
      }
    }
    
    console.log('Seed data creation process completed');
  } catch (error) {
    console.error('Error in database seeding process:', error);
  }
};

module.exports = { seedDatabase };
