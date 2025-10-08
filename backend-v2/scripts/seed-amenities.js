const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const amenitiesData = [
  // Kitchen & Dining
  { name: 'Kitchen', icon: '🍳', category: 'Kitchen', description: 'Fully equipped kitchen' },
  { name: 'Refrigerator', icon: '🧊', category: 'Kitchen', description: 'Refrigerator available' },
  { name: 'Microwave', icon: '📡', category: 'Kitchen', description: 'Microwave oven' },
  { name: 'Dishwasher', icon: '🍽️', category: 'Kitchen', description: 'Dishwasher available' },
  { name: 'Coffee Maker', icon: '☕', category: 'Kitchen', description: 'Coffee maker' },
  { name: 'Dining Table', icon: '🪑', category: 'Kitchen', description: 'Dining table' },
  
  // Bathroom
  { name: 'Private Bathroom', icon: '🚿', category: 'Bathroom', description: 'Private bathroom' },
  { name: 'Hot Water', icon: '♨️', category: 'Bathroom', description: 'Hot water available' },
  { name: 'Shower', icon: '🚿', category: 'Bathroom', description: 'Shower available' },
  { name: 'Bathtub', icon: '🛁', category: 'Bathroom', description: 'Bathtub available' },
  { name: 'Hair Dryer', icon: '💨', category: 'Bathroom', description: 'Hair dryer' },
  
  // Bedroom & Living
  { name: 'Air Conditioning', icon: '❄️', category: 'Climate', description: 'Air conditioning' },
  { name: 'Heating', icon: '🔥', category: 'Climate', description: 'Heating system' },
  { name: 'TV', icon: '📺', category: 'Entertainment', description: 'Television' },
  { name: 'WiFi', icon: '📶', category: 'Internet', description: 'Free WiFi' },
  { name: 'Workspace', icon: '💻', category: 'Work', description: 'Dedicated workspace' },
  { name: 'Washing Machine', icon: '🧺', category: 'Laundry', description: 'Washing machine' },
  { name: 'Dryer', icon: '🌪️', category: 'Laundry', description: 'Clothes dryer' },
  
  // Outdoor & Parking
  { name: 'Balcony', icon: '🌅', category: 'Outdoor', description: 'Balcony or terrace' },
  { name: 'Garden', icon: '🌿', category: 'Outdoor', description: 'Garden access' },
  { name: 'Pool', icon: '🏊', category: 'Outdoor', description: 'Swimming pool' },
  { name: 'Parking', icon: '🅿️', category: 'Parking', description: 'Free parking' },
  { name: 'Gym', icon: '💪', category: 'Fitness', description: 'Gym or fitness center' },
  
  // Safety & Security
  { name: 'Smoke Alarm', icon: '🚨', category: 'Safety', description: 'Smoke alarm' },
  { name: 'Carbon Monoxide Alarm', icon: '⚠️', category: 'Safety', description: 'Carbon monoxide alarm' },
  { name: 'First Aid Kit', icon: '🏥', category: 'Safety', description: 'First aid kit' },
  { name: 'Fire Extinguisher', icon: '🧯', category: 'Safety', description: 'Fire extinguisher' },
  { name: 'Security Cameras', icon: '📹', category: 'Security', description: 'Security cameras' },
  
  // Accessibility
  { name: 'Wheelchair Accessible', icon: '♿', category: 'Accessibility', description: 'Wheelchair accessible' },
  { name: 'Elevator', icon: '🛗', category: 'Accessibility', description: 'Elevator access' },
  
  // Pet Friendly
  { name: 'Pet Friendly', icon: '🐕', category: 'Pets', description: 'Pet friendly' },
  { name: 'Pet Bowls', icon: '🥣', category: 'Pets', description: 'Pet bowls provided' },
  
  // Luxury
  { name: 'Jacuzzi', icon: '🛁', category: 'Luxury', description: 'Jacuzzi or hot tub' },
  { name: 'Sauna', icon: '🧖', category: 'Luxury', description: 'Sauna available' },
  { name: 'Concierge', icon: '🎩', category: 'Luxury', description: 'Concierge service' },
  { name: 'Room Service', icon: '🍽️', category: 'Luxury', description: 'Room service' }
];

async function seedAmenities() {
  try {
    console.log('🌱 Starting to seed amenities...');
    
    // Clear existing amenities
    await prisma.amenities.deleteMany({});
    console.log('🗑️ Cleared existing amenities');
    
    // Insert new amenities
    const createdAmenities = await prisma.amenities.createMany({
      data: amenitiesData,
      skipDuplicates: true
    });
    
    console.log(`✅ Created ${createdAmenities.count} amenities`);
    
    // Show summary by category
    const categories = [...new Set(amenitiesData.map(a => a.category))];
    console.log('\n📊 Amenities by category:');
    
    for (const category of categories) {
      const count = amenitiesData.filter(a => a.category === category).length;
      console.log(`   ${category}: ${count} amenities`);
    }
    
    console.log('\n🎉 Amenities seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding amenities:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAmenities();
