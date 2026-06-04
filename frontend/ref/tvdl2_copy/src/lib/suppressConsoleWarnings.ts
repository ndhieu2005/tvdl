import React from 'react';

// Utility to suppress specific console warnings from third-party libraries
export function suppressReactWarnings() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const originalConsoleError = console.error;
    
    console.error = (...args: any[]) => {
      // Check if this is a React strict mode warning about lifecycle methods
      const errorMessage = args[0];
      
      if (
        typeof errorMessage === 'string' && 
        (
          errorMessage.includes('UNSAFE_componentWillReceiveProps') ||
          errorMessage.includes('ModelCollapse') ||
          errorMessage.includes('OperationContainer') ||
          errorMessage.includes('Using UNSAFE_componentWillReceiveProps in strict mode')
        )
      ) {
        // Suppress these specific warnings
        return;
      }
      
      // Let other errors through
      originalConsoleError.apply(console, args);
    };
    
    // Restore original console.error when component unmounts or page changes
    return () => {
      console.error = originalConsoleError;
    };
  }
  
  return () => {}; // No-op for SSR
}

// Alternative: Create a Higher Order Component to wrap problematic components
export function withWarningsSuppressed<P extends object = {}>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WrappedComponent: React.FC<P> = (props: P) => {
    // Suppress warnings only for this component's render cycle
    const restoreConsole = suppressReactWarnings();
    
    React.useEffect(() => {
      return restoreConsole;
    }, [restoreConsole]);
    
    return React.createElement(Component, props);
  };
  
  // Set display name for better debugging
  const componentName = (Component as any).displayName || (Component as any).name || 'Component';
  WrappedComponent.displayName = `withWarningsSuppressed(${componentName})`;
  
  return WrappedComponent;
}