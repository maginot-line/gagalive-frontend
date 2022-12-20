import { Box, Button, Grid, GridItem, Heading, HStack, Image, Input, InputGroup, InputRightElement, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { GiIceBomb } from 'react-icons/gi';
import io from 'socket.io-client';

interface IForm {
  message: string;
}

interface IImageForm {
  photo: FileList;
}

const socket = io('http://localhost:8000', { transports: ['websocket'] });

export default function Home() {
  // Image
  const [width, setWidth] = useState(window.innerWidth);
  window.addEventListener('resize', () => {
    setWidth(window.innerWidth);
  });
  const { register: imgRegister, handleSubmit: imgHandleSubmit, reset: imgReset, watch: imgWatch } = useForm<IImageForm>();
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
  const onImageSubmit = (data: IImageForm) => {
    console.log(data);
  };
  const photo = imgWatch('photo');
  const [photoPreview, setPhotoPreview] = useState('');
  useEffect(() => {
    if (photo && photo.length > 0) {
      const file = photo[0];
      setPhotoPreview(URL.createObjectURL(file));
    }
  }, [photo]);
  const cancelImage = () => {
    imgReset();
    setPhotoPreview('');
  };
  // Chat
  const { register, handleSubmit, reset } = useForm<IForm>();
  const [concurrentUsers, setConcurrentUsers] = useState(0);
  const [isJoinRoom, setIsJoinRoom] = useState(false);
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
  const joinRoom = () => {
    socket.emit('join_room', () => {});
    setIsJoinRoom(true);
  };
  const leaveRoom = () => {
    socket.emit('leave_room', () => {});
    const chatElement = document.getElementById('chatElement') as HTMLElement;
    const messageDiv = chatElement.querySelectorAll('div');
    messageDiv.forEach((e) => e.remove());
    reset();
    setIsJoinRoom(false);
  };
  const onSubmit = (data: IForm) => {
    if (data.message === '') {
      return;
    }
    socket.emit('send_message', data.message, () => {});
    addMessage(data.message, 'end');
    reset();
  };
  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit(onSubmit)();
    }
  };
  useEffect(() => {
    socket.on('welcome', (type: string) => {
      if (type === 'join') {
        addMessage('Welcome!', 'start');
      }
    });
    socket.on('concurrent_users', (users: number) => {
      setConcurrentUsers(users);
    });
    socket.on('break_room', (receiveToken: string) => {
      leaveRoom();
    });
    socket.on('receive_message', (message: string) => {
      addMessage(message, 'start');
      const chatElement = document.getElementById('chatElement') as HTMLElement;
      chatElement.scrollTop = chatElement.scrollHeight;
    });
  }, []);
  return (
    <HStack justifyContent='center'>
      <Grid w='container.lg' mt={10} gap={2} templateColumns={'repeat(2, 1fr)'} templateRows='repeat(1, 1fr)'>
        <GridItem colSpan={1} rowSpan={1}>
          <Grid gap={2} templateColumns={width > 640 ? 'repeat(2, 1fr)' : 'repeat(1, 1fr)'} templateRows='repeat(1, 1fr)'>
            <GridItem display='flex' flexDirection='column' colSpan={1} rowSpan={1} position='relative'>
              {photoPreview ? (
                <>
                  <Box position='relative' height='100%' width='100%'>
                    <HStack position='absolute' top='0' left='0' height='100%' width='100%'>
                      <HStack alignItems='center' justify='center' height='100%' width='100%'>
                        <Button colorScheme='cyan' onSubmit={imgHandleSubmit(onImageSubmit)}>
                          Send
                        </Button>
                        <Button colorScheme='red' onClick={cancelImage}>
                          Cancel
                        </Button>
                      </HStack>
                    </HStack>
                    <Image src={photoPreview} borderRadius='lg' height='100%' width='100%' objectFit='cover' />
                  </Box>
                </>
              ) : (
                <>
                  <Box position='relative' height='100%' width='100%' borderWidth={3} borderRadius='lg' borderStyle='dashed' as='form'>
                    <HStack position='absolute' top='0' left='0' height='100%' width='100%'>
                      <HStack height='100%' width='100%' alignItems='center' justify='center' spacing='4'>
                        <VStack p='8' textAlign='center' spacing='1'>
                          <Heading fontSize='lg' fontWeight='bold'>
                            Drop images here
                          </Heading>
                          <Text fontWeight='light'>or click to upload</Text>
                        </VStack>
                      </HStack>
                    </HStack>
                    <Input
                      {...imgRegister('photo')}
                      type='file'
                      height='100%'
                      width='100%'
                      position='absolute'
                      top='0'
                      left='0'
                      opacity='0'
                      aria-hidden='true'
                      accept='image/*'
                    />
                  </Box>
                </>
              )}
            </GridItem>
            {(width > 640 ? [0, 1, 2, 3, 4] : [0, 1]).map((_, i) => (
              <GridItem colSpan={1} rowSpan={1} key={i}>
                <Box position='relative'>
                  <Image
                    borderRadius='lg'
                    src='https://a0.muscache.com/im/pictures/miso/Hosting-47181423/original/39c9d4e7-78d0-4807-9f0d-3029d987d02a.jpeg?im_w=720'
                  />
                  <Button onClick={() => timer(i.toString())} variant='unstyled' position='absolute' top={0} right={1} color='white'>
                    <HStack justifyContent='start' spacing={1}>
                      <GiIceBomb size='20px' />
                      <p id={'timer' + i}>60</p>
                    </HStack>
                  </Button>
                </Box>
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
          />
          <Box id='buttonElement' mt={2}>
            <HStack spacing='4' justifyContent='end'>
              <Text>{concurrentUsers} connected</Text>
              {isJoinRoom ? (
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
                {!isJoinRoom ? (
                  <>
                    <Input {...register('message')} pr='4.5rem' variant='filled' placeholder='Enter your message' isDisabled />
                  </>
                ) : (
                  <>
                    <Input {...register('message')} pr='4.5rem' variant='filled' placeholder='Enter your message' />
                  </>
                )}
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
