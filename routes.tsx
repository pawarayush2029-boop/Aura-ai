import ChatPage from './pages/ChatPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Chat',
    path: '/chat',
    element: <ChatPage />,
  },
];

export default routes;
