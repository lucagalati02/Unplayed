import React from 'react'
import { DialogBody, DialogCloseTrigger, DialogContent, DialogFooter, DialogHeader, DialogRoot, DialogTitle, DialogTrigger } from "./dialog"
import { CheckboxCard } from "./checkbox-card"
import { Button, Center, VStack, Separator, Heading } from '@chakra-ui/react';
import { SlUserFollowing } from "react-icons/sl";
import { useDispatch, useSelector } from 'react-redux';
import * as apple_music from '../components/apple_music'
import axios from 'axios';

function ArtistDialog() {
  const gradientStyle = {
    display: "flex", // Flexbox to align icon and text
    alignItems: "center", // Center-align items vertically
    justifyContent: "center", // Center-align items horizontally
    background: "linear-gradient(to right, #FB5C74, #FA233B)",
    border: "none",
    padding: "12px 24px",
    gap: "8px", // Space between text and icon
  };
  const availableArtists = useSelector(state => state.music.availableArtists)

  return (
    <DialogRoot size="cover" placement="center" motionPreset="scale" closeOnEscape={false} closeOnInteractOutside={false} scrollBehavior={'inside'}>
      <DialogTrigger asChild>
        <Button style={gradientStyle} size="lg" mt={6}>
          Following {<SlUserFollowing />}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Center>
              <Heading size="5xl">
                Follow Artists
              </Heading>
            </Center>
          </DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <VStack spacing={4} w="100%">
            {availableArtists.map(artist => (
              <Center key={artist.id} w="100%">
                <button style={{ width: '35%' }} onClick={() => window.alert(`Following ${artist.attributes.name}`)}>
                  <CheckboxCard label={artist.attributes.name} variant='surface' size='lg' w="100%"/>
                </button>
              </Center>
            ))}
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  )
}

export default ArtistDialog