import '@fontsource/inter';
import '@fontsource/work-sans';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { withProse } from '@nikolovlazar/chakra-ui-prose';
import React from 'react';
import FlowsListWorkadventure from './components/workAdventureFlowMenu';

const theme = extendTheme(
  {
    fonts: {
      heading: `Work Sans, system-ui, sans-serif`,
      body: `Inter, system-ui, sans-serif`,
    },
  },
  withProse()
);

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <FlowsListWorkadventure />
    </ChakraProvider>
  );
}
