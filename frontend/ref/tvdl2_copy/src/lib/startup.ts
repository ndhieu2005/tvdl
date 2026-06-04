import { initAdminUser } from '@/lib/init-admin';

let isStartupComplete = false;

/**
 * Startup initialization tasks
 */
export async function runStartupTasks() {
  if (isStartupComplete) {
    console.log('🔄 [STARTUP] Startup tasks already completed, skipping...');
    return;
  }

  console.log('🚀 [STARTUP] Running startup tasks...');
  
  try {
    // Initialize admin user if not exists
    console.log('🔧 [STARTUP] Initializing admin user...');
    await initAdminUser();
    
    console.log('✅ [STARTUP] All startup tasks completed successfully');
    isStartupComplete = true;
  } catch (error) {
    console.error('❌ [STARTUP] Error during startup tasks:', error);
    // Don't throw - let the app continue to start
  }
}

// This function will be called from instrumentation.ts when server starts