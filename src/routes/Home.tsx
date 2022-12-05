import { Box, Button, Grid, GridItem, HStack, Image, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import io from 'socket.io-client';

export default function Home() {
  const socket = io('http://127.0.0.1:8000');
  const [isEnterRoom, setIsEnterRoom] = useState(false);
  const roomRef = useRef<HTMLInputElement>(null);
  const enterRoom = () => {
    socket.emit('enter_room', () => {});
    setIsEnterRoom(true);
  };
  socket.on('welcome', () => {
    console.log('welcome');
    const text = document.createElement('p');
    text.innerText = 'welcome';
    roomRef.current?.appendChild(text);
  });
  return (
    <HStack justifyContent='center'>
      <Grid h='85vh' w='container.lg' mt={10} columnGap={4} templateRows='repeat(2, 1fr)' templateColumns='repeat(6, 1fr)'>
        <GridItem colSpan={4}>
          <Grid rowGap={4} columnGap={4} templateColumns='repeat(2, 1fr)'>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <GridItem colSpan={1} key={item}>
                <Image
                  h='250'
                  borderRadius={'lg'}
                  src='https://a0.muscache.com/im/pictures/miso/Hosting-47181423/original/39c9d4e7-78d0-4807-9f0d-3029d987d02a.jpeg?im_w=720'
                />
              </GridItem>
            ))}
          </Grid>
        </GridItem>
        <GridItem rowSpan={2} colSpan={2}>
          <Box ref={roomRef} h='722' borderWidth={1} borderRadius='lg' py='2' px='4' />
          <InputGroup mt={4} size='md'>
            <Input pr='4.5rem' variant='filled' placeholder='Enter your message' />
            <InputRightElement w='4.5rem'>
              {!isEnterRoom ? (
                <Button onClick={enterRoom} h='1.75rem' size='sm' variant='solid'>
                  Join
                </Button>
              ) : (
                <Button h='1.75rem' size='sm' variant='solid'>
                  Send
                </Button>
              )}
            </InputRightElement>
          </InputGroup>
        </GridItem>
      </Grid>
    </HStack>
  );
}
