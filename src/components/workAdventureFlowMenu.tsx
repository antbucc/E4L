import {
  Avatar,
  Badge,
  Box,
  Card,
  CardBody,
  CardFooter,
  Heading,
  HStack,
  LinkBox,
  LinkOverlay,
  SpaceProps,
  Spacer,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import SearchBar from './SearchBar/SearchBar';
import { API } from '../data/api';
//import cardImage from './test_card.png';
import { PolyglotFlow } from '../types/PolyglotFlow';
import React from 'react';

type FlowCardProps = {
  py?: SpaceProps['py'];
  px?: SpaceProps['px'];
  flow: PolyglotFlow;
};

const FlowCard = ({ flow, px, py }: FlowCardProps) => {
  return (
    <>
      <LinkBox px={px} py={py}>
        <Card
          direction={{ base: 'column', sm: 'row' }}
          overflow="hidden"
          variant="outline"
        >
          {/*
          <Image
            objectFit="cover"
            maxW={{ base: '100%', sm: '200px' }}
            src={cardImage.src}
            alt="Flow card"
          />*/}
          <Stack w="full">
            <CardBody>
              <Heading size="md">{flow.title}</Heading>
              {flow.tags &&
                flow.tags.map((tag, id) => (
                  <Badge key={id} mr={1} colorScheme={tag.color}>
                    {tag.name}
                  </Badge>
                ))}
              <Text pt={2} whiteSpace={'pre-wrap'} noOfLines={3}>
                {flow.description}
              </Text>
              <Text pt={2} whiteSpace={'pre-wrap'} noOfLines={3}>
                In this Learning Path there are: {flow.nodes.length} learning
                activities
              </Text>
            </CardBody>

            <CardFooter>
              {
                <>
                  <Spacer />
                  <HStack pl={5} spacing="2" align="center" h="full">
                    <Text fontSize={'xs'}>{flow.author?.username}</Text>
                    <Avatar name={flow.author?.username} size="sm" />
                  </HStack>
                </>
              }
            </CardFooter>
          </Stack>
        </Card>
        <LinkOverlay href={`/flows/${flow._id}`} />
      </LinkBox>
    </>
  );
};

const FlowsListWorkadventure = () => {
  const [flows, setFlows] = useState<PolyglotFlow[]>([]);
  const [selectedFlowId] = useState('');
  const [suggestions] = useState(['']);
  const [searchValue, setSearchValue] = useState('');
  const { onOpen: dfOnOpen } = useDisclosure();

  // User need to be loaded

  useEffect(() => {
    let queryparams = '?';
    if (searchValue) queryparams += 'q=' + searchValue;
    API.loadFlowList(queryparams).then((resp) => {
      setFlows(resp.data);
    });
  }, [API]);

  useEffect(() => {
    if (!selectedFlowId) return;
    dfOnOpen();
  }, [dfOnOpen, selectedFlowId]);

  if (!flows)
    return (
      <>
        <div>error</div>
      </>
    );
  return (
    <>
      <Box px="10%">
        <Heading py="5%">Learning Paths</Heading>
        <SearchBar
          inputValue={searchValue}
          setInputValue={setSearchValue}
          items={suggestions}
          placeholder="Search learning paths..."
        />
        <Tabs pt="3%">
          <TabList>
            <Tab>All</Tab>
          </TabList>

          <TabPanels>
            <TabPanel pt="3%">
              {flows.length ? (
                flows.map((flow, id) => (
                  <FlowCard key={id} flow={flow} py={1} px={1} />
                ))
              ) : (
                <Heading size={'md'} textAlign="center">
                  You have 0 Learning paths available! Create one with the +
                  button ;)
                </Heading>
              )}
            </TabPanel>
            <TabPanel>
              {flows.length ? (
                flows.map((flow, id) => (
                  <FlowCard key={id} flow={flow} py={1} px={1} />
                ))
              ) : (
                <Heading size={'md'} textAlign="center">
                  No flows found! Search something different ;)
                </Heading>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </>
  );
};

export default FlowsListWorkadventure;
