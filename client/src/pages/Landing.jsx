import React from 'react';
import { SimpleGrid, Box, Center, VStack, Text, Highlight, Image, List, IconButton, Button } from '@chakra-ui/react';
import { LuCircleCheck, LuSun, LuMoon } from "react-icons/lu"
import axios from 'axios'
import ThemeChanger from '../components/ThemeChanger'
import { useDispatch, useSelector } from 'react-redux';
import * as apple_music from '../components/apple_music'

function Landing() {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.theme);

  return (
    <div>
      <ThemeChanger />
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} height="90vh" p={15}>
        {/* Left Section */}
        <Box>
          <Center height="100%">
            <VStack spacing={4} align="center">
              <Text as="h1" fontSize="7xl" fontWeight="bold" textAlign="center">
                <Highlight
                  query="Unplayed"
                  styles={{
                    background: "linear-gradient(to right, #FB5C74, #FA233B)",
                    WebkitBackgroundClip: "text",
                    color: "transparent", // Ensures only the gradient is visible
                  }}
                >
                  Welcome to Unplayed
                </Highlight>
              </Text>
              <Text fontSize="xl" textAlign="center" marginBottom="4">
                Discover new & unplayed songs from your favorite artists effortlessly.
              </Text>
              <List.Root variant="plain" align="center" marginBottom="5">
                <List.Item>
                  <List.Indicator asChild color="green.500">
                    <LuCircleCheck />
                  </List.Indicator>
                  Create a custom list of artists to keep track of
                </List.Item>
                <List.Item>
                  <List.Indicator asChild color="green.500">
                    <LuCircleCheck />
                  </List.Indicator>
                  Automatically generate playlists of new music
                </List.Item>
                <List.Item>
                  <List.Indicator asChild color="green.500">
                    <LuCircleCheck />
                  </List.Indicator>
                  MusicKit integreation for a seamless experience
                </List.Item>
              </List.Root>

              <Button colorScheme={theme == "dark" ? "white" : "black"} onClick={() => apple_music.LogIn()}>
                Authorize Unplayed with Apple Music
              </Button>
              
              {/* <AppleSignin
                authOptions={{
                  clientId: 'com.unplayed.unplayed-sid', // Service ID
                  scope: 'email name', // The scope of information you want to access
                  redirectURI: 'https://3d96-76-69-123-245.ngrok-free.app/', // Your OAuth Redirect URL
                  state: 'state', // Any additional state
                  usePopup: true, // Use popup for authentication instead of redirect
                }}
                onSuccess={handleAppleResponse} // Callback after successful signin
                onError={(error) => console.error('Failed:', error)} // Callback after failed signin
                uiType={theme == "dark" ? "light" : "dark"} // UI Type
                style={{ borderColor: theme == "dark" ? "white" : "black" }}
              /> */}
            </VStack>
          </Center>
        </Box>

        {/* Right Section */}
        <Box display="flex" alignItems="center" justifyContent="center">
          <Image src="AppleMusic.svg" width="60%"/>
        </Box>
      </SimpleGrid>
    </div>
    
  );
}

export default Landing;
