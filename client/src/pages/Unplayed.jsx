import React, { useEffect, useState } from 'react';
import { Button, Center, Text, VStack, Highlight } from '@chakra-ui/react';
import ThemeChanger from '../components/ThemeChanger';
import { IoMusicalNotesSharp } from "react-icons/io5";
import { CiLogout } from "react-icons/ci";
import { logout } from '../redux/authentication';
import { setAvailableArtists, setFollowing, setUnplayed } from '../redux/music';
import { useDispatch, useSelector } from 'react-redux';
import * as apple_music from '../components/apple_music'
import axios from 'axios';
import ArtistDialog from '../components/ArtistDialog';

function Unplayed() {
  const dispatch = useDispatch();
  const following = useSelector(state => state.music.following);
  const user = useSelector(state => state.authentication.user);
  const refresh = useSelector(state => state.music.refresh);
  

  const gradientStyle = {
    display: "flex", // Flexbox to align icon and text
    alignItems: "center", // Center-align items vertically
    justifyContent: "center", // Center-align items horizontally
    background: "linear-gradient(to right, #FB5C74, #FA233B)",
    border: "none",
    padding: "12px 24px",
    gap: "8px", // Space between text and icon
  };

  useEffect(() => {
    const url = 'http://localhost:5000/get_user_following'
    axios.post(url, {
      email: user
      }).then((response) => {
      dispatch(setFollowing(response.data.FOLLOWING.following))
    }).catch((error) => {
      console.log('Get Following Error: ', error)
    })
  }, [refresh])

  useEffect(() => {
    const url = 'http://localhost:5000/get_library_artists'
    axios.post(url, {
      params: { 
        headers: apple_music.getHeader()
      }}).then((response) => {
      const data = response.data.data
      dispatch(setAvailableArtists(response.data.data))
    }).catch((error) => {
      console.log('Get library artists Error: ', error)
    })
  }, [refresh])

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
            You are following {following.length} artists
          </Text>

          {/* Dialog for selecting artists */}
          <ArtistDialog />

          {/* Button to generate unplayed playlist */}
          <Button disabled={following.length == 0 ? true : false} style={gradientStyle} size="lg" mt={6}>
            Generate Unplayed Playlist {<IoMusicalNotesSharp />}
          </Button>

          {/* Logout Button */}
          <Button colorPalette="gray" mt={6} onClick={() => {
            dispatch(logout())
            apple_music.LogOut()
          }}>
            Log Out {<CiLogout />}
          </Button>
        </VStack>
      </Center>
    </div>
  );
}

export default Unplayed;
