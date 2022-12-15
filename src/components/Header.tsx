import { HStack, IconButton, Text, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { FaReact, FaMoon, FaSun } from 'react-icons/fa';

export default function Header() {
  const { toggleColorMode } = useColorMode();
  const Icon = useColorModeValue(FaMoon, FaSun);
  return (
    <HStack py={5} borderBottomWidth={1} justifyContent={'center'}>
      <HStack w={'container.xl'} justifyContent={'space-between'}>
        <HStack alignItems={'center'} spacing={5} color={'blue.400'}>
          <FaReact size={48} />
          <Text as={'span'} ml={2} fontSize={'2xl'} fontWeight={'bold'}>
            가가라이브
          </Text>
        </HStack>
        <HStack spacing={2}>
          <IconButton onClick={toggleColorMode} variant={'ghost'} aria-label={'Toggle dark mode'} icon={<Icon />} />
        </HStack>
      </HStack>
    </HStack>
  );
}
