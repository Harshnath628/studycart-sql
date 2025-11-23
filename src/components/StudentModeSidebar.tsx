import { useEffect, useState } from 'react';
import { X, Code2, Trash2 } from 'lucide-react';
import { studentMode, SQLLog, formatSQL } from '@/lib/studentMode';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface StudentModeSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StudentModeSidebar({ isOpen, onClose }: StudentModeSidebarProps) {
  const [logs, setLogs] = useState<SQLLog[]>([]);

  useEffect(() => {
    const unsubscribe = studentMode.subscribe(setLogs);
    setLogs(studentMode.getLogs());
    return () => {
      unsubscribe();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-background/95 backdrop-blur-xl border-l border-student-cyan/30 shadow-2xl z-50 animate-slide-in-right">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-student-cyan/30 bg-gradient-to-r from-student-cyan/10 to-student-purple/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-student-cyan neon-cyan" />
              <h2 className="text-lg font-semibold text-student-cyan neon-cyan">
                Student Mode
              </h2>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => studentMode.clearLogs()}
                className="hover:bg-student-cyan/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-student-cyan/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            SQL queries generated from your actions
          </p>
        </div>

        {/* SQL Logs */}
        <ScrollArea className="flex-1 p-4">
          {logs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Code2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No SQL queries yet</p>
              <p className="text-xs mt-1">Start browsing to see queries</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div
                  key={log.id}
                  className="glass rounded-lg p-4 border border-student-cyan/20 hover:border-student-cyan/40 transition-all animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium text-student-cyan">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="text-xs bg-muted/50 p-3 rounded overflow-x-auto font-mono">
                    <code className="text-foreground">
                      {formatSQL(log.sql, log.params)}
                    </code>
                  </pre>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-student-cyan/30 bg-gradient-to-r from-student-purple/10 to-student-magenta/10">
          <p className="text-xs text-muted-foreground text-center">
            💡 Tip: Each action on the website generates SQL queries
          </p>
        </div>
      </div>
    </div>
  );
}