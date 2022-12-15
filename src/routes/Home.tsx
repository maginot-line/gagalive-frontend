import { Box, Button, Grid, GridItem, HStack, Image, Input, InputGroup, InputRightElement, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { GiIceBomb } from 'react-icons/gi';
import io from 'socket.io-client';

interface IForm {
  message: string;
}

let roomId: string;
const getTime = new Date().getTime().toString(36);
const randomString = Math.random().toString(36).substring(2, 11);
const token = getTime + randomString;
const socket = io('http://127.0.0.1:8000', { transports: ['websocket', 'polling'], auth: { token } });

export default function Home() {
  const { register, handleSubmit, reset } = useForm<IForm>();
  const [concurrentUsers, setConcurrentUsers] = useState(0);
  const [isEnterRoom, setIsEnterRoom] = useState(false);
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
  socket.on('connect', () => {});
  socket.on('concurrent_users', (users: number) => {
    setConcurrentUsers(users);
  });
  const joinRoom = () => {
    socket.emit('join_room', () => {});
    setIsEnterRoom(true);
  };
  socket.on('welcome', (type: string) => {
    if (type === 'join') {
      addMessage('Welcome!', 'start');
    }
  });
  const leaveRoom = () => {
    socket.emit('leave_room', () => {});
    const chatElement = document.getElementById('chatElement') as HTMLElement;
    const messageDiv = chatElement.querySelectorAll('div');
    messageDiv.forEach((e) => e.remove());
    setIsEnterRoom(false);
  };
  socket.on('break_room', (receiveToken: string) => {
    if (token !== receiveToken) {
      leaveRoom();
    }
  });
  const onSubmit = (data: IForm) => {
    if (data.message === '') {
      return;
    }
    socket.emit('send_message', roomId, data.message, () => {});
    reset();
  };
  socket.on('receive_message', (receiveToken: string, message: string) => {
    if (token !== receiveToken) {
      addMessage(message, 'start');
    } else {
      addMessage(message, 'end');
    }
    const chatElement = document.getElementById('chatElement') as HTMLElement;
    chatElement.scrollTop = chatElement.scrollHeight;
  });
  return (
    <HStack justifyContent='center'>
      <Grid w='container.lg' mt={10} gap={2} templateColumns={'repeat(2, 1fr)'} templateRows='repeat(1, 1fr)'>
        <GridItem colSpan={1} rowSpan={1}>
          <Grid gap={2} templateColumns={width > 640 ? 'repeat(2, 1fr)' : 'repeat(1, 1fr)'} templateRows='repeat(1, 1fr)'>
            {(width > 640 ? [0, 1, 2, 3, 4, 5] : [0, 1, 2]).map((_, i) => (
              <GridItem position='relative' colSpan={1} rowSpan={1} key={i}>
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
        </GridItem>
        <GridItem display='flex' flexDirection='column' colSpan={1} rowSpan={1}>
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
      </Grid>
    </HStack>
  );
}
