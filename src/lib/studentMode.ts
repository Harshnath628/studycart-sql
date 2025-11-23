// Student Mode SQL Logger Module
// This module tracks and stores SQL equivalents of user actions

export interface SQLLog {
  id: string;
  timestamp: Date;
  action: string;
  sql: string;
  params?: Record<string, any>;
}

class StudentModeManager {
  private logs: SQLLog[] = [];
  private isEnabled: boolean = false;
  private listeners: Set<(logs: SQLLog[]) => void> = new Set();

  enable() {
    this.isEnabled = true;
    this.notifyListeners();
  }

  disable() {
    this.isEnabled = false;
    this.logs = [];
    this.notifyListeners();
  }

  toggle() {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  isActive() {
    return this.isEnabled;
  }

  logSQL(action: string, sql: string, params?: Record<string, any>) {
    if (!this.isEnabled) return;

    const log: SQLLog = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      action,
      sql: sql.trim(),
      params,
    };

    this.logs.push(log);
    this.notifyListeners();
  }

  getLogs(): SQLLog[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    this.notifyListeners();
  }

  subscribe(listener: (logs: SQLLog[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.getLogs()));
  }
}

// Singleton instance
export const studentMode = new StudentModeManager();

// Helper function to format SQL with parameters
export function formatSQL(sql: string, params?: Record<string, any>): string {
  if (!params) return sql;
  
  let formatted = sql;
  Object.entries(params).forEach(([key, value]) => {
    const placeholder = `<${key}>`;
    const formattedValue = typeof value === 'string' ? `'${value}'` : String(value);
    formatted = formatted.replace(new RegExp(placeholder, 'g'), formattedValue);
  });
  
  return formatted;
}