import React from 'react'
import { DialogBody, DialogCloseTrigger, DialogContent, DialogFooter, DialogHeader, DialogRoot, DialogTitle, DialogTrigger } from "./dialog"
import { CheckboxCard } from "./checkbox-card"
import { Button, Center, VStack, Separator, Heading } from '@chakra-ui/react';
import { SlUserFollowing } from "react-icons/sl";
import { useDispatch, useSelector } from 'react-redux';
import { Table } from "@chakra-ui/react"
import * as apple_music from '../components/apple_music'
import axios from 'axios';
import { toggleArtistClick } from '../redux/music';
import { Skeleton } from "../components/skeleton"

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
  const dispatch = useDispatch()

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
          {
            availableArtists == null ?
              <Skeleton 
                variant="shine"
                        width="full"
                        height="4"
                        css={{
                          "--start-color": "#FB5C74",
                          "--end-color": "#FA233B",
                        }}
              />
              :
              <Table.Root size="md">
                <Table.Header>
                  <Table.Row>
                    <Table.Cell>Artist</Table.Cell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {
                    availableArtists.map((artist, index) => (
                      <Table.Row key={index}>
                        <Table.Cell>
                          {artist.name}
                        </Table.Cell>
                      </Table.Row>
                    ))
                  }
                </Table.Body>
              </Table.Root>

          }
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  )
}

export default ArtistDialog