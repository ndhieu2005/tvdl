// Server-side settings fetch functions
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fetch settings from database on server-side
export async function getServerSettings() {
  try {
    const settings = await prisma.settings.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return settings;
  } catch (error) {
    console.error('Error fetching server settings:', error);
    return null;
  }
}

// Get Google Analytics ID specifically
export async function getGoogleAnalyticsId(): Promise<string | null> {
  try {
    const settings = await getServerSettings();
    const gaId = settings?.googleAnalyticsId;
    
    // Return valid GA ID or null
    if (gaId && gaId !== 'GA_MEASUREMENT_ID' && gaId.startsWith('G-')) {
      return gaId;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Google Analytics ID:', error);
    return null;
  }
}

// Get Google AdSense ID specifically
export async function getGoogleAdsenseId(): Promise<string | null> {
  try {
    const settings = await getServerSettings();
    const adsenseId = settings?.googleAdsenseId;
    
    // Return valid AdSense ID or null
    if (adsenseId && adsenseId !== 'ca-pub-XXXXXXXXXXXXXXXX' && adsenseId.startsWith('ca-pub-')) {
      return adsenseId;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Google AdSense ID:', error);
    return null;
  }
}