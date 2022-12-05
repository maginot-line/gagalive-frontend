import { Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Root() {
  return (
    <Box>
      <Header />
      <Outlet />
      <script src='/socket.io/socket.io.js' />
    </Box>
  );
}
