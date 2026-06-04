'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Activity } from 'lucide-react';

interface AssetHealthStatusProps {
  logoUrl: string;
  faviconUrl: string;
}

interface HealthReport {
  logoExists: boolean;
  faviconExists: boolean;
  logoPath: string;
  faviconPath: string;
  errors: string[];
  warnings: string[];
}

export const AssetHealthStatus: React.FC<AssetHealthStatusProps> = ({ logoUrl, faviconUrl }) => {
  const [healthReport, setHealthReport] = useState<HealthReport | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    checkHealth();
  }, [logoUrl, faviconUrl]);

  const checkHealth = async () => {
    setIsChecking(true);
    
    try {
      console.log('🔍 Asset Health Check - Testing URLs:');
      console.log('  Logo URL:', logoUrl);
      console.log('  Favicon URL:', faviconUrl);
      
      // Client-side health check
      const logoCheck = logoUrl ? await checkAssetExists(logoUrl) : false;
      const faviconCheck = faviconUrl ? await checkAssetExists(faviconUrl) : false;
      
      console.log('🔍 Asset Health Check - Results:');
      console.log('  Logo accessible:', logoCheck);
      console.log('  Favicon accessible:', faviconCheck);
      
      const report: HealthReport = {
        logoExists: logoCheck,
        faviconExists: faviconCheck,
        logoPath: logoUrl || '',
        faviconPath: faviconUrl || '',
        errors: [],
        warnings: []
      };

      if (!logoCheck && logoUrl) {
        report.errors.push(`Logo file not accessible: ${logoUrl}`);
      }
      if (!faviconCheck && faviconUrl) {
        report.errors.push(`Favicon file not accessible: ${faviconUrl}`);
      }
      if (!logoUrl) {
        report.warnings.push('No logo configured');
      }
      if (!faviconUrl) {
        report.warnings.push('No favicon configured');
      }

      setHealthReport(report);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const checkAssetExists = (assetUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Add cache busting parameter to avoid browser cache issues
      const cacheBuster = `?t=${Date.now()}`;
      const testUrl = assetUrl + cacheBuster;
      
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => {
        // If image fails, also try a HEAD request for non-image files
        fetch(assetUrl, { method: 'HEAD', cache: 'no-cache' })
          .then(response => resolve(response.ok))
          .catch(() => resolve(false));
      };
      img.src = testUrl;
    });
  };

  const getHealthScore = (): number => {
    if (!healthReport) return 0;
    
    let score = 0;
    if (healthReport.logoExists) score += 50;
    if (healthReport.faviconExists) score += 50;
    
    // Deduct for errors and warnings
    score -= healthReport.errors.length * 10;
    score -= healthReport.warnings.length * 5;
    
    return Math.max(0, Math.min(100, score));
  };

  const getHealthColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (score >= 70) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const healthScore = getHealthScore();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-blue-500" />
          <h3 className="text-sm font-medium text-gray-900">Asset Health Status</h3>
        </div>
        <button
          onClick={checkHealth}
          disabled={isChecking}
          className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
          <span>Check</span>
        </button>
      </div>

      {healthReport && (
        <div className="space-y-3">
          {/* Overall Health Score */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              {getHealthIcon(healthScore)}
              <span className="text-sm font-medium text-gray-900">Overall Health</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-bold ${getHealthColor(healthScore)}`}>
                {healthScore}%
              </span>
            </div>
          </div>

          {/* Individual Asset Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
              {healthReport.logoExists ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-xs text-gray-700">Logo</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
              {healthReport.faviconExists ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-xs text-gray-700">Favicon</span>
            </div>
          </div>

          {/* Errors */}
          {healthReport.errors.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-red-700">Errors:</span>
              {healthReport.errors.map((error, index) => (
                <div key={index} className="flex items-center space-x-1 text-xs text-red-600">
                  <XCircle className="h-3 w-3" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {healthReport.warnings.length > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-yellow-700">Warnings:</span>
              {healthReport.warnings.map((warning, index) => (
                <div key={index} className="flex items-center space-x-1 text-xs text-yellow-600">
                  <AlertTriangle className="h-3 w-3" />
                  <span>{warning}</span>
                </div>
              ))}
            </div>
          )}

          {/* Last Checked */}
          {lastChecked && (
            <div className="text-xs text-gray-500">
              Last checked: {lastChecked.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};