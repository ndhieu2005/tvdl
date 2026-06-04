// Force Node.js runtime for instrumentation
export const runtime = 'nodejs';

export async function register() {
  console.log('🔧 [INSTRUMENTATION] Server is starting up...');
  
  // Only run startup tasks in development or when explicitly needed
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { runStartupTasks } = await import('@/lib/startup');
      await runStartupTasks();
    } catch (error) {
      console.error('❌ [INSTRUMENTATION] Error running startup tasks:', error);
    }
  }
}