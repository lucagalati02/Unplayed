import React from 'react';
import { Box, Button, Center, Text, VStack, Highlight } from '@chakra-ui/react';
import ThemeChanger from '../components/ThemeChanger';
import { SlUserFollowing } from "react-icons/sl";
import { IoMusicalNotesSharp } from "react-icons/io5";
import { CiLogout } from "react-icons/ci";

function Unplayed() {
  const gradientStyle = {
    display: "flex", // Flexbox to align icon and text
    alignItems: "center", // Center-align items vertically
    justifyContent: "center", // Center-align items horizontally
    background: "linear-gradient(to right, #FB5C74, #FA233B)",
    border: "none",
    padding: "12px 24px",
    gap: "8px", // Space between text and icon
  };

  return (
    <div>
      <ThemeChanger />
      <Center height="90vh">
        <VStack spacing={10} align="center"> {/* Increased spacing */}
          {/* App Title */}
          <Text as="h1" fontSize="8xl" fontWeight="bold" textAlign="center">
            <Highlight
              query="Unplayed"
              styles={{
                background: "linear-gradient(to right, #FB5C74, #FA233B)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Unplayed
            </Highlight>
          </Text>

          {/* Following Info */}
          <Text fontSize="xl" mt={100}> {/* Added margin for spacing */}
            You are following <b>{followedArtists}</b> artists
          </Text>

          {/* Button to open modal for selecting artists */}
          <Button style={gradientStyle} size="lg" mt={6}>
            Following {<SlUserFollowing />}
          </Button>

          {/* Button to generate unplayed playlist */}
          <Button style={gradientStyle} size="lg" mt={6}>
            Generate Unplayed Playlist {<IoMusicalNotesSharp />}
          </Button>

          {/* Logout Button */}
          <Button colorPalette="gray" mt={6} onClick={() => dispatch(logout())}>
            Log Out {<CiLogout />}
          </Button>
        </VStack>
      </Center>
    </div>
  );
}

export default Unplayed;
