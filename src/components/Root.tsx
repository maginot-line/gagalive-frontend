import { Outlet } from 'react-router-dom';

export default function Root() {
  return (
    <div>
      <h1>
        Root
        <Outlet />
      </h1>
      <script src='/socket.io/socket.io.js' />
    </div>
  );
}
