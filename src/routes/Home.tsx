import { Box, Button, Grid, GridItem, HStack, Image, Input, InputGroup, InputRightElement, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { GiIceBomb } from 'react-icons/gi';
import io from 'socket.io-client';

interface IForm {
  message: string;
}

let roomId: string;
let socketId: string;

export default function Home() {
  const socket = io('http://127.0.0.1:8000', { transports: ['websocket'] });
  const [isEnterRoom, setIsEnterRoom] = useState(false);
  const { register, handleSubmit, reset } = useForm<IForm>();
  const addMessage = (message: string, justifyContent: string) => {
    const chatElement = document.getElementById('chatElement') as HTMLElement;
    const messageDiv = document.createElement('div');
    messageDiv.style.display = 'flex';
    messageDiv.style.justifyContent = justifyContent;
    messageDiv.style.marginTop = '0.25rem';
    const messageP = document.createElement('span');
    messageP.style.borderRadius = '0.375rem';
    messageP.style.borderWidth = '1px';
    messageP.style.borderColor = 'gray.200';
    messageP.style.padding = '0.25rem';
    messageP.style.wordBreak = 'break-all';
    messageP.innerText = message;
    messageDiv.appendChild(messageP);
    chatElement.appendChild(messageDiv);
  };
  socket.on('connect', () => {
    socketId = socket.id;
  });
  const [concurrentUsers, setConcurrentUsers] = useState(0);
  socket.on('concurrent_users', (users: number) => {
    setConcurrentUsers(users);
  });
  const joinRoom = () => {
    socket.emit('join_room', () => {});
    setIsEnterRoom(true);
  };
  const leaveRoom = () => {
    socket.emit('leave_room', roomId, socketId, () => {});
    const chatElement = document.getElementById('chatElement') as HTMLElement;
    const messageDiv = chatElement.querySelectorAll('div');
    messageDiv.forEach((e) => e.remove());
    setIsEnterRoom(false);
  };
  const onSubmit = (data: IForm) => {
    if (data.message === '') {
      return;
    }
    socket.emit('send_message', roomId, socketId, data.message, () => {});
    reset();
  };
  socket.on('welcome', (type: string, receiveRoomId: string) => {
    roomId = receiveRoomId;
    if (type === 'join') {
      addMessage('Welcome!', 'start');
    }
  });
  socket.on('receive_message', (receiveSocketId: string, message: string) => {
    if (socketId === receiveSocketId) {
      addMessage(message, 'end');
    } else {
      addMessage(message, 'start');
    }
    const chatElement = document.getElementById('chatElement') as HTMLElement;
    chatElement.scrollTop = chatElement.scrollHeight;
  });
  socket.on('break_room', (receiveSocketId) => {
    if (socketId !== receiveSocketId) {
      leaveRoom();
    }
  });
  const timer = (i: string) => {
    let time = 60;
    const timerElement = document.getElementById(`timer${i}`) as HTMLElement;
    const timer = setInterval(() => {
      time--;
      timerElement.innerText = time.toString();
      if (time === 0) {
        clearInterval(timer);
      }
    }, 1000);
  };
  const [width, setWidth] = useState(window.innerWidth);
  window.addEventListener('resize', () => {
    setWidth(window.innerWidth);
  });
  return (
    <HStack justifyContent='center'>
      <Grid w='container.xl' mt={10} gap={2} templateRows='repeat(3, 1fr)' templateColumns={width > 640 ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)'}>
        <GridItem display='flex' flexDirection='column' rowSpan={3} colSpan={2}>
          <Box
            id='chatElement'
            overflowY='auto'
            flex='1 1 auto'
            height={0}
            borderWidth={1}
            borderRadius='lg'
            p={4}
            sx={{
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }}
          ></Box>
          <Box id='buttonElement' mt={2}>
            <HStack spacing='4' justifyContent='end'>
              <Text>{concurrentUsers} connected</Text>
              {isEnterRoom ? (
                <Button onClick={leaveRoom} size='sm'>
                  Leave Room
                </Button>
              ) : (
                <Button onClick={joinRoom} size='sm'>
                  Enter Room
                </Button>
              )}
            </HStack>
            <Box as='form' onSubmit={handleSubmit(onSubmit)}>
              <InputGroup mt={2} size='md'>
                <Input {...register('message')} pr='4.5rem' variant='filled' placeholder='Enter your message' />
                <InputRightElement w='4.5rem'>
                  <Button type='submit' h='1.75rem' size='sm' variant='solid'>
                    Send
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Box>
          </Box>
        </GridItem>
        {(width > 640 ? [0, 1, 2, 3, 4, 5] : [0, 1, 2]).map((_, i) => (
          <GridItem position='relative' rowSpan={1} colSpan={1} key={i}>
            <Image
              borderRadius={'lg'}
              src='https://a0.muscache.com/im/pictures/miso/Hosting-47181423/original/39c9d4e7-78d0-4807-9f0d-3029d987d02a.jpeg?im_w=720'
            />
            <Button onClick={() => timer(i.toString())} variant='unstyled' position='absolute' top={0} right={1} color='white'>
              <HStack justifyContent='start' spacing={1}>
                <GiIceBomb size='20px' />
                <p id={'timer' + i}>60</p>
              </HStack>
            </Button>
          </GridItem>
        ))}
      </Grid>
    </HStack>
  );
}
