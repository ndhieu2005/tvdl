const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateRoomTypes() {
  try {
    console.log('🔄 Starting room type migration...');
    
    // Get current room bookings count by type
    const currentBookings = await prisma.roomBooking.groupBy({
      by: ['roomType'],
      _count: {
        id: true
      }
    });
    
    console.log('📊 Current room bookings by type:');
    currentBookings.forEach(booking => {
      console.log(`  - ${booking.roomType}: ${booking._count.id} bookings`);
    });
    
    // Update all room bookings to READING_ROOM
    const updateResult = await prisma.roomBooking.updateMany({
      where: {
        roomType: {
          not: 'READING_ROOM' // Update all room types except READING_ROOM
        }
      },
      data: {
        roomType: 'READING_ROOM'
      }
    });
    
    console.log(`✅ Updated ${updateResult.count} room bookings to READING_ROOM`);
    
    // Verify the update
    const updatedBookings = await prisma.roomBooking.groupBy({
      by: ['roomType'],
      _count: {
        id: true
      }
    });
    
    console.log('📊 Updated room bookings by type:');
    updatedBookings.forEach(booking => {
      console.log(`  - ${booking.roomType}: ${booking._count.id} bookings`);
    });
    
    console.log('🎉 Room type migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
updateRoomTypes()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });