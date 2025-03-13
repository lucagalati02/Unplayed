"use client";
import React, { useRef, useMemo, useEffect } from "react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogRoot,
  DialogTrigger,
} from "./dialog";
import { Button, Center, Heading, HStack } from "@chakra-ui/react";
import { SlUserFollowing } from "react-icons/sl";
import { useDispatch, useSelector } from "react-redux";
import { toggleArtistClick, toggleSaveSelections, toggleExit } from "../redux/music";
import { Skeleton } from "../components/skeleton";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Toaster, toaster } from "./toaster";
import axios from 'axios';

function ArtistDialog() {
  const gradientStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(to right, #FB5C74, #FA233B)",
    border: "none",
    padding: "12px 24px",
    gap: "8px",
  };

  const user = useSelector(state => state.authentication.user);
  const availableArtists = useSelector((state) => state.music.availableArtists);
  const tempAvailableArtists = useSelector((state) => state.music.tempAvailableArtists);
  const dispatch = useDispatch();
  const previousSelectionRef = useRef([]);

  const columns = [
    { field: "name", headerName: "Artist", flex: 1, headerAlign: "center" },
  ];

  const paginationModel = { page: 0, pageSize: 100 };

  // Compute the initial rowSelectionModel based on clicked attribute
  const selectedIds = useMemo(() => {
    if (!tempAvailableArtists) return [];
    return tempAvailableArtists
      .filter((artist) => artist.clicked)
      .map((artist) => artist.id);
  }, [tempAvailableArtists]);

  // Sync previousSelectionRef with current selectedIds whenever they change
  useEffect(() => {
    previousSelectionRef.current = selectedIds;
  }, [selectedIds]);

  // Handler for Select All button
  const handleSelectAll = () => {
    if (tempAvailableArtists) {
      tempAvailableArtists.forEach((artist) => {
        if (!artist.clicked) {
          dispatch(toggleArtistClick(artist.id));
        }
      });
    }
  };

  // Handler for Clear Selections button
  const handleClearSelections = () => {
    if (tempAvailableArtists) {
      tempAvailableArtists.forEach((artist) => {
        if (artist.clicked) {
          dispatch(toggleArtistClick(artist.id));
        }
      });
    }
  };

  const saveToDatabase = () => {
    const url = 'http://localhost:5000/save_selected_artists'
    const selectedArtists = tempAvailableArtists
      .filter((artist) => artist.clicked)
      .map((artist) => artist.name);
    try {
      axios.post(url, {
      email: user,
      selectedArtists: selectedArtists
      }).then((response) => {
      console.log('saved artists to db: ', response.data.result)
      })
    } catch (error) {
      console.log("Error saving artists to database: ", error);
    }
  }

  return (
    <DialogRoot
      size="cover"
      placement="center"
      motionPreset="scale"
      closeOnEscape={false}
      closeOnInteractOutside={false}
      scrollBehavior={"inside"}
      onExitComplete={() => dispatch(toggleExit())}
    >
      <DialogTrigger asChild>
        <Button style={gradientStyle} size="lg" mt={6}>
          Following {<SlUserFollowing />}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Center>
              <Heading size="5xl">Follow Artists</Heading>
            </Center>
          </DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          {tempAvailableArtists == null ? (
            <>
              <p>Retrieving Artists...</p>
              <Skeleton
                variant="shine"
                width="full"
                height="4"
                css={{
                  "--start-color": "#FB5C74",
                  "--end-color": "#FA233B",
                }}
              />
            </>
          ) : (
            <>
              <Paper sx={{ height: "90%", width: "100%", overflow: "hidden" }}>
                <DataGrid
                  rows={tempAvailableArtists}
                  columns={columns}
                  pagination
                  initialState={{ pagination: { paginationModel } }}
                  sx={{
                    border: 0,
                    "& .MuiDataGrid-columnHeaderCheckbox .MuiDataGrid-columnHeaderTitleContainer": {
                      display: "none",
                    },
                  }}
                  checkboxSelection
                  rowSelectionModel={selectedIds} // Controlled selection
                  onRowSelectionModelChange={(newSelectionModel) => {
                    const previousSelection = previousSelectionRef.current;
                    const added = newSelectionModel.filter(
                      (id) => !previousSelection.includes(id)
                    );
                    const removed = previousSelection.filter(
                      (id) => !newSelectionModel.includes(id)
                    );

                    if (added.length > 0) {
                      dispatch(toggleArtistClick(added[0]));
                    } else if (removed.length > 0) {
                      dispatch(toggleArtistClick(removed[0]));
                    }

                    previousSelectionRef.current = newSelectionModel;
                  }}
                />
                <Toaster />
              </Paper>
              <HStack mt="5" justify="center">
                <Button onClick={handleClearSelections} m="3">
                  Clear Selections
                </Button>
                <Button onClick={handleSelectAll} m="3">
                  Select All
                </Button>
                <Button onClick={() => {
                  dispatch(toggleSaveSelections());
                  saveToDatabase();
                  toaster.create({
                    title: 'Successfully Saved Artists',
                    type: "success",
                  });
                }} m="3">
                  Save Selections
                </Button>
              </HStack>
            </>
          )}
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}

export default ArtistDialog;
