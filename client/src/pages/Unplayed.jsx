import React, { useEffect, forwardRef } from 'react';
import { Button, Center, Text, VStack, Highlight, Input, HStack, Spinner } from '@chakra-ui/react';
import ThemeChanger from '../components/ThemeChanger';
import { IoMusicalNotesSharp } from "react-icons/io5";
import { CiLogout } from "react-icons/ci";
import { logout } from '../redux/authentication';
import { setAvailableArtists, setFollowing, setUnplayed, setStartDate } from '../redux/music';
import { useDispatch, useSelector } from 'react-redux';
import * as apple_music from '../components/apple_music'
import axios from 'axios';
import ArtistDialog from '../components/ArtistDialog';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../components/datepicker_override.css";

function Unplayed() {
  const dispatch = useDispatch();
  const following = useSelector(state => state.music.following);
  const user = useSelector(state => state.authentication.user);
  const refresh = useSelector(state => state.music.refresh);
  const startDate = useSelector(state => state.music.startDate);
  const [generating, setGenerating] = React.useState(false);

  const ChakraDateInput = forwardRef(({ value, onClick, width = "105px", size = "sm" }, ref) => (
  <Input
    ref={ref}
    value={value}
    onClick={onClick}
    readOnly
    cursor="pointer"
    width={width}
    size={size}
  />
));

  

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
          {generating ? (<Spinner mt={6}></Spinner>) : (
            <Button disabled={following.length == 0 ? true : false} style={gradientStyle} size="lg" mt={6} onClick={() => {
              setGenerating(true)
              const url = 'http://localhost:5000/generate_unplayed_playlist'
              axios.post(url, {
                params: {
                  headers: apple_music.getHeader(),
                  startDate: startDate,
                  endDate: new Date(),
                  email: user,
                  following: following
                }
              }).then((response) => {
                console.log('Generate Unplayed Playlist Response: ', response)
                setGenerating(false)
              })
            }}>
              Generate Unplayed Playlist {<IoMusicalNotesSharp />}
            </Button>
          )}

          {/* Date Picker */}
          <HStack mt={6}>
            <Text fontSize="lg">Get music between </Text>
            <DatePicker
              selected={startDate}
              onChange={(date) => dispatch(setStartDate(date))}
              maxDate={new Date()}
              customInput={<ChakraDateInput />}
              dateFormat="yyyy-MM-dd"
            />
            <Text fontSize="lg"> - today. </Text>
          </HStack>

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
