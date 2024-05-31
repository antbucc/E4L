import React from 'react';
import { ChakraProvider, Button, Box, Flex, Text } from '@chakra-ui/react';

type Coordinate = { x: string; y: string };

export const messagesPopup = (
  message: string,
  position: Coordinate
): React.JSX.Element => {
  return (
    <ChakraProvider resetCSS>
      <Box height={200} width={80} right={position.x} top={position.y}>
        <Flex justifyContent="center" display="flex" mb={0} pb={0}>
          <Text>{message}</Text>
        </Flex>
        <Button variant="solid" size="md" display="flex" mb={0}>
          Close
        </Button>
      </Box>
    </ChakraProvider>
  );
};
