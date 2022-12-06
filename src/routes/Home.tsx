import { Box, Button, Grid, GridItem, HStack, Image, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import io from 'socket.io-client';

interface IForm {
  message: string;
}

let roomId: string;
let socketId: string;

export default function Home() {
  const socket = io('http://127.0.0.1:8000');
  const [isEnterRoom, setIsEnterRoom] = useState(false);
  const { register, handleSubmit, reset } = useForm<IForm>();
  const addMessage = (message: string, justifyContent: string) => {
    const roomBoxElement = document.getElementById('roomBoxElement') as HTMLElement;
    const messageDiv = document.createElement('div');
    messageDiv.style.display = 'flex';
    messageDiv.style.justifyContent = justifyContent;
    messageDiv.style.marginTop = '0.5rem';
    const messageP = document.createElement('span');
    messageP.style.borderRadius = '0.375rem';
    messageP.style.borderWidth = '1px';
    messageP.style.borderColor = 'gray.200';
    messageP.style.padding = '0.5rem';
    messageP.innerText = message;
    messageDiv.appendChild(messageP);
    roomBoxElement.appendChild(messageDiv);
  };
  socket.on('connect', () => {
    socketId = socket.id;
  });
  const joinRoom = () => {
    socket.emit('join_room', () => {});
    setIsEnterRoom(true);
  };
  const leaveRoom = () => {
    socket.emit('leave_room', roomId, () => {});
    setIsEnterRoom(false);
  };
  const onSubmit = (data: IForm) => {
    socket.emit('send_message', roomId, socketId, data.message, () => {});
    reset();
  };
  socket.on('welcome', (data) => {
    roomId = data;
    addMessage('Welcome!', 'start');
  });
  socket.on('receive_message', (receiveId: string, message: string) => {
    if (socketId === receiveId) {
      addMessage(message, 'end');
      return;
    } else {
      addMessage(message, 'start');
    }
  });
  socket.on('break_room', () => {
    leaveRoom();
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
          <Box id='roomBoxElement' position='relative' h='722' borderWidth={1} borderRadius='lg' paddingTop={'12'} paddingBottom={4} px='4'>
            {isEnterRoom ? (
              <Button onClick={leaveRoom} position='absolute' top={0} right={0}>
                Leave Room
              </Button>
            ) : (
              <Button onClick={joinRoom} position='absolute' top={0} right={0}>
                Enter Room
              </Button>
            )}
          </Box>
          <Box as='form' onSubmit={handleSubmit(onSubmit)}>
            <InputGroup mt={4} size='md'>
              <Input {...register('message')} pr='4.5rem' variant='filled' placeholder='Enter your message' />
              <InputRightElement w='4.5rem'>
                <Button type='submit' h='1.75rem' size='sm' variant='solid'>
                  Send
                </Button>
              </InputRightElement>
            </InputGroup>
          </Box>
        </GridItem>
      </Grid>
    </HStack>
  );
}
