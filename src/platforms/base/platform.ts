// Base platform interface
// This file defines the IPlatform interface that all platforms must implement
// For now, it's kept minimal - will be expanded as needed

export interface IPlatform {
  getConfig(): {
    name: string;
    loginUrl: string;
    selectors: {
      version: string;
      loggedInIndicators: string[];
    };
  };
  
  validateLogin(page: any): Promise<boolean>;
}