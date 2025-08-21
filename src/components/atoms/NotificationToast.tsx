import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Notification } from '../../hooks/useNotifications';

interface NotificationToastProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const getNotificationStyles = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200 text-green-800';
    case 'error':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'info':
      return 'bg-blue-50 border-blue-200 text-blue-800';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    default:
      return '📢';
  }
};

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onRemove,
}) => {
  const handleRemove = () => {
    onRemove(notification.id);
  };

  return (
    <div
      className={`border rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out ${getNotificationStyles(
        notification.type
      )}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-lg">{getNotificationIcon(notification.type)}</span>
          <div className="flex-1">
            <h4 className="font-medium text-sm">{notification.title}</h4>
            <p className="text-sm mt-1">{notification.message}</p>
            <p className="text-xs mt-2 opacity-75">
              {format(notification.timestamp, 'HH:mm', { locale: es })}
            </p>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="ml-4 text-sm opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Cerrar notificación"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
