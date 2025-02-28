"use client"
import React, { useState, useRef } from 'react'
import { DialogBody, DialogCloseTrigger, DialogContent, DialogFooter, DialogHeader, DialogRoot, DialogTitle, DialogTrigger } from "./dialog"
import { Button, Center, Heading } from '@chakra-ui/react';
import { SlUserFollowing } from "react-icons/sl";
import { useDispatch, useSelector } from 'react-redux';
import * as apple_music from '../components/apple_music'
import axios from 'axios';
import { toggleArtistClick } from '../redux/music';
import { Skeleton } from "../components/skeleton"
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

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
  const previousSelectionRef = useRef([]);

  const columns = [
    { field: 'name', headerName: 'Artist', flex: 1, headerAlign: 'center' },
  ]

  const paginationModel = { page: 0, pageSize: 25 };

  return (
    <DialogRoot size="cover" placement="center" motionPreset="scale" closeOnEscape={false} closeOnInteractOutside={false} scrollBehavior={'inside'}  >
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
              >
              </Skeleton>
              :
              <Paper sx={{height: '100%', width: '100%' }}>
                <DataGrid 
                  rows={availableArtists}
                  columns={columns}
                  pagination
                  initialState={{ pagination: { paginationModel } }}
                  sx={{ 
                    border: 0, 
                    "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer": {
                      display: "none"
                    }
                  }}
                  // onRowClick={(params) => {
                  //   dispatch(toggleArtistClick(params.row.id));
                  // }}
                  checkboxSelection
                  onRowSelectionModelChange={(newSelectionModel) => {
                    const previousSelection = previousSelectionRef.current;
                    // Find the ID that was added or removed by comparing old and new selections
                    const added = newSelectionModel.filter(id => !previousSelection.includes(id));
                    const removed = previousSelection.filter(id => !newSelectionModel.includes(id));
            
                    // If an ID was added (checkbox checked)
                    if (added.length > 0) {
                      dispatch(toggleArtistClick(added[0]));
                    }
                    // If an ID was removed (checkbox unchecked)
                    else if (removed.length > 0) {
                      dispatch(toggleArtistClick(removed[0]));
                    }
            
                    // Update the ref with the new selection
                    previousSelectionRef.current = newSelectionModel;
                  }}
                />
              </Paper>
          }
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  )
}

export default ArtistDialog