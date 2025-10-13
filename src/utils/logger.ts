type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 100;
  private isDevelopment: boolean = import.meta.env.DEV;

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private addLog(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: this.formatTimestamp(),
    };

    this.logs.push(entry);

    // Mantener solo los últimos maxLogs logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // En desarrollo, también enviar a console
    if (this.isDevelopment) {
      this.logToConsole(level, message, data);
    }

    // Aquí podrías enviar logs a un servicio externo como Sentry, LogRocket, etc.
    // this.sendToExternalService(entry);
  }

  private logToConsole(level: LogLevel, message: string, data?: any) {
    const styles: Record<LogLevel, string> = {
      info: 'color: #3B82F6; font-weight: bold',
      warn: 'color: #F59E0B; font-weight: bold',
      error: 'color: #EF4444; font-weight: bold',
      debug: 'color: #8B5CF6; font-weight: bold',
    };

    const emoji: Record<LogLevel, string> = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🐛',
    };

    console.log(
      `%c${emoji[level]} [${level.toUpperCase()}] ${message}`,
      styles[level],
      data || ''
    );
  }

  public info(message: string, data?: any) {
    this.addLog('info', message, data);
  }

  public warn(message: string, data?: any) {
    this.addLog('warn', message, data);
  }

  public error(message: string, data?: any) {
    this.addLog('error', message, data);
  }

  public debug(message: string, data?: any) {
    this.addLog('debug', message, data);
  }

  // Obtener todos los logs
  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Obtener logs por nivel
  public getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Limpiar logs
  public clearLogs() {
    this.logs = [];
  }

  // Exportar logs como JSON
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Exportar instancia singleton
export const logger = new Logger();
