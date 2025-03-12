import React from 'react';
import { SimpleGrid, Box, Center, VStack, Text, Highlight, Image, List, IconButton, Button, HStack } from '@chakra-ui/react';
import { LuCircleCheck } from "react-icons/lu"
import { IoIosMusicalNote } from "react-icons/io";
import axios from 'axios'
import ThemeChanger from '../components/ThemeChanger'
import { useDispatch, useSelector } from 'react-redux';
import * as apple_music from '../components/apple_music'
import AppleSignin from 'react-apple-signin-auth';
import { login, authorize } from '../redux/authentication';


function Landing() {
  const dispatch = useDispatch();
  const theme = useSelector(state => state.theme.theme);
  const isSignedIn = useSelector(state => state.authentication.isSignedIn);
  const isAuthorized = useSelector(state => state.authentication.isAuthorized);

  const handleAppleResponse = (response) => {
    const code = response.authorization.code;

    if (!code) {
      console.error('Authorization code not received:', response);
      return;
    }
    
    try {
      axios.post('http://127.0.0.1:5000/apple-callback',
        {
          code: code,
        }
      ).then((response) => {
        dispatch(login(response.data));
      }).catch((error) => {
        console.log('Inner Error sending code to backend:', error);
      });
    }
    catch (error) {
      console.log('Outer Error sending code to backend:', error);
    }
  };

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
                  <List.Indicator asChild color="white">
                    <IoIosMusicalNote />
                  </List.Indicator>
                  Create a custom list of artists to keep track of
                </List.Item>
                <List.Item>
                  <List.Indicator asChild color="white">
                    <IoIosMusicalNote />
                  </List.Indicator>
                  Automatically generate playlists of new music
                </List.Item>
                <List.Item>
                  <List.Indicator asChild color="white">
                    <IoIosMusicalNote />
                  </List.Indicator>
                  MusicKit integreation for a seamless experience
                </List.Item>
              </List.Root>
              <p>Get started by completing both steps below!</p>
              <HStack>
                <AppleSignin
                  authOptions={{
                    clientId: 'com.serviceid.unplayed-sign-in', // Service ID
                    scope: 'email', // The scope of information you want to access
                    redirectURI: 'https://de8f-76-69-123-245.ngrok-free.app/', // Your OAuth Redirect URL
                    usePopup: true, // Use popup for authentication instead of redirect
                  }}
                  onSuccess={handleAppleResponse} // Callback after successful signin
                  onError={(error) => console.error('Failed:', error)} // Callback after failed signin
                  uiType={theme == "dark" ? "light" : "dark"} // UI Type
                  style={{ borderColor: theme == "dark" ? "white" : "black" }}
                />
                {isSignedIn ? <LuCircleCheck style={{color: 'green'}} /> : null}
              </HStack>
              <HStack>
                <Button colorScheme={theme == "dark" ? "white" : "black"} style={{backgroundColor: theme == "dark" ? "white" : "black"}} onClick={async () => {
                  try {
                    await apple_music.LogIn(); // Wait for login to complete
                    const isLoggedIn = apple_music.isLoggedIn();
                    console.log(isLoggedIn);
                    dispatch(authorize(isLoggedIn));
                  } catch (error) {
                    console.error("Login failed:", error);
                  }
                }}>
                  Authorize Unplayed with Apple Music
                </Button>
                {isAuthorized ? <LuCircleCheck style={{color: 'green'}} /> : null}
              </HStack>
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
