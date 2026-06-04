/**
 * Asset Health Check Utility
 * Monitors and ensures logo and favicon files exist
 */

import fs from 'fs';
import path from 'path';

export interface AssetHealthReport {
  logoExists: boolean;
  faviconExists: boolean;
  logoPath: string;
  faviconPath: string;
  errors: string[];
  warnings: string[];
}

export class AssetHealthChecker {
  private publicDir: string;

  constructor() {
    this.publicDir = path.join(process.cwd(), 'public');
  }

  /**
   * Check health of logo and favicon assets
   */
  async checkAssetHealth(logoUrl: string, faviconUrl: string): Promise<AssetHealthReport> {
    const report: AssetHealthReport = {
      logoExists: false,
      faviconExists: false,
      logoPath: '',
      faviconPath: '',
      errors: [],
      warnings: []
    };

    // Check logo
    if (logoUrl) {
      const logoPath = path.join(this.publicDir, logoUrl);
      report.logoPath = logoPath;
      
      if (fs.existsSync(logoPath)) {
        report.logoExists = true;
        
        // Check file size
        const stats = fs.statSync(logoPath);
        if (stats.size === 0) {
          report.errors.push('Logo file is empty');
        } else if (stats.size > 5 * 1024 * 1024) { // 5MB
          report.warnings.push('Logo file is quite large (>5MB)');
        }
      } else {
        report.errors.push(`Logo file not found: ${logoPath}`);
      }
    } else {
      report.warnings.push('No logo URL configured');
    }

    // Check favicon
    if (faviconUrl) {
      const faviconPath = path.join(this.publicDir, faviconUrl);
      report.faviconPath = faviconPath;
      
      if (fs.existsSync(faviconPath)) {
        report.faviconExists = true;
        
        // Check file size
        const stats = fs.statSync(faviconPath);
        if (stats.size === 0) {
          report.errors.push('Favicon file is empty');
        } else if (stats.size > 1024 * 1024) { // 1MB
          report.warnings.push('Favicon file is quite large (>1MB)');
        }
      } else {
        report.errors.push(`Favicon file not found: ${faviconPath}`);
      }
    } else {
      report.warnings.push('No favicon URL configured');
    }

    return report;
  }

  /**
   * Find alternative assets if current ones are missing
   */
  async findAlternativeAssets(): Promise<{ logo: string | null; favicon: string | null }> {
    const alternatives = {
      logo: null as string | null,
      favicon: null as string | null
    };

    // Find alternative logo
    const logoDir = path.join(this.publicDir, 'logo');
    if (fs.existsSync(logoDir)) {
      const logoFiles = fs.readdirSync(logoDir)
        .filter(file => file.match(/\.(svg|png|jpg|jpeg|webp)$/i))
        .sort((a, b) => {
          const aTime = this.extractTimestamp(a);
          const bTime = this.extractTimestamp(b);
          return bTime - aTime;
        });
      
      if (logoFiles.length > 0) {
        alternatives.logo = `/logo/${logoFiles[0]}`;
      }
    }

    // Find alternative favicon
    const faviconDir = path.join(this.publicDir, 'logo');
    if (fs.existsSync(faviconDir)) {
      const faviconFiles = fs.readdirSync(faviconDir)
        .filter(file => file.match(/\.(ico|png)$/i))
        .sort((a, b) => {
          const aTime = this.extractTimestamp(a);
          const bTime = this.extractTimestamp(b);
          return bTime - aTime;
        });
      
      if (faviconFiles.length > 0) {
        alternatives.favicon = `/logo/${faviconFiles[0]}`;
      }
    }

    // Check default files
    const defaultFiles = [
      { type: 'logo', paths: ['/images/logo.svg', '/logo.svg', '/images/logo.png'] },
      { type: 'favicon', paths: ['/favicon.ico', '/icon.ico'] }
    ];

    for (const defaultFile of defaultFiles) {
      if (alternatives[defaultFile.type as keyof typeof alternatives] === null) {
        for (const defaultPath of defaultFile.paths) {
          if (fs.existsSync(path.join(this.publicDir, defaultPath))) {
            alternatives[defaultFile.type as keyof typeof alternatives] = defaultPath;
            break;
          }
        }
      }
    }

    return alternatives;
  }

  /**
   * Get asset statistics
   */
  async getAssetStatistics(): Promise<{
    logoCount: number;
    faviconCount: number;
    totalSize: number;
    oldestFile: string | null;
    newestFile: string | null;
  }> {
    const stats = {
      logoCount: 0,
      faviconCount: 0,
      totalSize: 0,
      oldestFile: null as string | null,
      newestFile: null as string | null
    };

    const assetDirs = ['logo'];
    const allFiles: Array<{ name: string; path: string; timestamp: number; size: number }> = [];

    for (const dir of assetDirs) {
      const fullDir = path.join(this.publicDir, dir);
      if (!fs.existsSync(fullDir)) continue;

      const files = fs.readdirSync(fullDir);
      for (const file of files) {
        const filePath = path.join(fullDir, file);
        const fileStats = fs.statSync(filePath);
        
        // Determine if it's a logo or favicon based on filename
        if (file.toLowerCase().includes('favicon') || file.match(/\.(ico)$/i)) {
          stats.faviconCount++;
        } else if (file.toLowerCase().includes('logo') || file.match(/\.(svg|png|jpg|jpeg|webp)$/i)) {
          stats.logoCount++;
        }
        
        stats.totalSize += fileStats.size;
        
        allFiles.push({
          name: file,
          path: filePath,
          timestamp: this.extractTimestamp(file),
          size: fileStats.size
        });
      }
    }

    // Find oldest and newest files
    if (allFiles.length > 0) {
      allFiles.sort((a, b) => a.timestamp - b.timestamp);
      stats.oldestFile = allFiles[0].name;
      stats.newestFile = allFiles[allFiles.length - 1].name;
    }

    return stats;
  }

  private extractTimestamp(filename: string): number {
    const match = filename.match(/(\d{13})/);
    return match ? parseInt(match[1]) : 0;
  }
}

// Export singleton instance
export const assetHealthChecker = new AssetHealthChecker();