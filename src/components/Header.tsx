import { HStack, IconButton, Text } from '@chakra-ui/react';
import { FaReact, FaMoon } from 'react-icons/fa';

export default function Header() {
  return (
    <HStack px={10} py={5} borderBottomWidth={1} justifyContent={'center'}>
      <HStack w={'container.lg'} justifyContent={'space-between'}>
        <HStack alignItems={'center'} spacing={5} color={'blue.400'}>
          <FaReact size={48} />
          <Text as={'span'} ml={2} fontSize={'2xl'} fontWeight={'bold'}>
            가가라이브
          </Text>
        </HStack>
        <HStack spacing={2}>
          <IconButton variant={'ghost'} aria-label={'Toggle dark mode'} icon={<FaMoon />} />
        </HStack>
      </HStack>
    </HStack>
  );
}
