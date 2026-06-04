import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function cleanupSecurityData() {
  console.log('🧹 Starting security data cleanup...');
  
  try {
    const now = new Date();
    
    // 1. Cleanup expired blocked IPs
    const expiredBlockedIPs = await prisma.blockedIP.updateMany({
      where: {
        expiresAt: {
          lt: now
        },
        isActive: true
      },
      data: {
        isActive: false
      }
    });
    
    console.log(`✅ Deactivated ${expiredBlockedIPs.count} expired blocked IPs`);
    
    // 2. Remove old login attempts (older than 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oldLoginAttempts = await prisma.loginAttempt.deleteMany({
      where: {
        timestamp: {
          lt: thirtyDaysAgo
        }
      }
    });
    
    console.log(`✅ Removed ${oldLoginAttempts.count} old login attempts`);
    
    // 3. Remove expired session tokens
    const expiredSessions = await prisma.sessionToken.updateMany({
      where: {
        expiresAt: {
          lt: now
        },
        isActive: true
      },
      data: {
        isActive: false
      }
    });
    
    console.log(`✅ Deactivated ${expiredSessions.count} expired session tokens`);
    
    // 4. Remove very old inactive blocked IPs (older than 90 days)
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const oldBlockedIPs = await prisma.blockedIP.deleteMany({
      where: {
        blockedAt: {
          lt: ninetyDaysAgo
        },
        isActive: false
      }
    });
    
    console.log(`✅ Removed ${oldBlockedIPs.count} very old blocked IP records`);
    
    // 5. Remove very old inactive session tokens (older than 90 days)
    const oldSessions = await prisma.sessionToken.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo
        },
        isActive: false
      }
    });
    
    console.log(`✅ Removed ${oldSessions.count} very old session tokens`);
    
    console.log('🎉 Security data cleanup completed successfully!');
    
    return {
      success: true,
      summary: {
        expiredBlockedIPs: expiredBlockedIPs.count,
        oldLoginAttempts: oldLoginAttempts.count,
        expiredSessions: expiredSessions.count,
        oldBlockedIPs: oldBlockedIPs.count,
        oldSessions: oldSessions.count
      }
    };
    
  } catch (error) {
    console.error('❌ Error during security data cleanup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getSecurityStatistics() {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Login attempts statistics
    const loginStats = await prisma.loginAttempt.groupBy({
      by: ['success'],
      _count: {
        success: true
      },
      where: {
        timestamp: {
          gte: twentyFourHoursAgo
        }
      }
    });
    
    const successfulLogins = loginStats.find(s => s.success)?._count.success || 0;
    const failedLogins = loginStats.find(s => !s.success)?._count.success || 0;
    
    // Blocked IPs statistics
    const activeBlockedIPs = await prisma.blockedIP.count({
      where: {
        isActive: true,
        expiresAt: {
          gt: now
        }
      }
    });
    
    const expiredBlockedIPs = await prisma.blockedIP.count({
      where: {
        OR: [
          { isActive: false },
          { expiresAt: { lt: now } }
        ]
      }
    });
    
    // Session tokens statistics
    const activeSessions = await prisma.sessionToken.count({
      where: {
        isActive: true,
        expiresAt: {
          gt: now
        }
      }
    });
    
    const expiredSessions = await prisma.sessionToken.count({
      where: {
        OR: [
          { isActive: false },
          { expiresAt: { lt: now } }
        ]
      }
    });
    
    // Weekly trends
    const weeklyLoginAttempts = await prisma.loginAttempt.groupBy({
      by: ['success'],
      _count: {
        success: true
      },
      where: {
        timestamp: {
          gte: sevenDaysAgo
        }
      }
    });
    
    const weeklySuccessful = weeklyLoginAttempts.find(s => s.success)?._count.success || 0;
    const weeklyFailed = weeklyLoginAttempts.find(s => !s.success)?._count.success || 0;
    
    // Top failed IP addresses
    const topFailedIPs = await prisma.loginAttempt.groupBy({
      by: ['ipAddress'],
      _count: {
        ipAddress: true
      },
      where: {
        success: false,
        timestamp: {
          gte: sevenDaysAgo
        }
      },
      orderBy: {
        _count: {
          ipAddress: 'desc'
        }
      },
      take: 10
    });
    
    return {
      success: true,
      data: {
        last24Hours: {
          successful: successfulLogins,
          failed: failedLogins,
          total: successfulLogins + failedLogins,
          successRate: successfulLogins + failedLogins > 0 
            ? Math.round((successfulLogins / (successfulLogins + failedLogins)) * 100)
            : 0
        },
        last7Days: {
          successful: weeklySuccessful,
          failed: weeklyFailed,
          total: weeklySuccessful + weeklyFailed,
          successRate: weeklySuccessful + weeklyFailed > 0 
            ? Math.round((weeklySuccessful / (weeklySuccessful + weeklyFailed)) * 100)
            : 0
        },
        blockedIPs: {
          active: activeBlockedIPs,
          expired: expiredBlockedIPs,
          total: activeBlockedIPs + expiredBlockedIPs
        },
        sessions: {
          active: activeSessions,
          expired: expiredSessions,
          total: activeSessions + expiredSessions
        },
        topFailedIPs: topFailedIPs.map(ip => ({
          ipAddress: ip.ipAddress,
          attempts: ip._count.ipAddress
        }))
      }
    };
    
  } catch (error) {
    console.error('Error getting security statistics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function runSecurityMaintenance() {
  console.log('🔧 Starting security maintenance...');
  
  try {
    // Run cleanup
    const cleanupResult = await cleanupSecurityData();
    
    // Get updated statistics
    const statsResult = await getSecurityStatistics();
    
    // Log summary
    console.log('📊 Security maintenance completed:');
    console.log(`   - Cleanup: ${cleanupResult.success ? 'Success' : 'Failed'}`);
    console.log(`   - Statistics: ${statsResult.success ? 'Success' : 'Failed'}`);
    
    return {
      success: cleanupResult.success && statsResult.success,
      cleanup: cleanupResult,
      statistics: statsResult
    };
    
  } catch (error) {
    console.error('❌ Error during security maintenance:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Schedule cleanup to run periodically
export function scheduleSecurityMaintenance() {
  // Run cleanup every 6 hours
  setInterval(async () => {
    await runSecurityMaintenance();
  }, 6 * 60 * 60 * 1000); // 6 hours in milliseconds
  
  console.log('⏰ Security maintenance scheduled to run every 6 hours');
}