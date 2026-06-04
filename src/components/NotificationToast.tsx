/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { Notification } from '../types';

interface NotificationProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export default function NotificationToast({ notifications, onDismiss }: NotificationProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {notifications.map((notif) => {
          let bgColor = 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-200';
          let Icon = Info;

          if (notif.type === 'success') {
            bgColor = 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-200';
            Icon = CheckCircle;
          } else if (notif.type === 'error') {
            bgColor = 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-900 dark:text-rose-200';
            Icon = AlertCircle;
          }

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className={`p-4 rounded-lg border shadow-lg flex items-start gap-3 backdrop-blur-sm ${bgColor}`}
              id={`toast-${notif.id}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm font-medium pr-2">
                {notif.message}
              </div>
              <button
                onClick={() => onDismiss(notif.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                id={`toast-close-${notif.id}`}
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
