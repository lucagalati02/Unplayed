"use client";
import React, { useRef, useMemo } from "react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogRoot,
  DialogTrigger,
} from "./dialog";
import { Button, Center, Heading } from "@chakra-ui/react";
import { SlUserFollowing } from "react-icons/sl";
import { useDispatch, useSelector } from "react-redux";
import * as apple_music from "../components/apple_music";
import axios from "axios";
import { toggleArtistClick } from "../redux/music";
import { Skeleton } from "../components/skeleton";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";

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
  const availableArtists = useSelector((state) => state.music.availableArtists);
  const dispatch = useDispatch();
  const previousSelectionRef = useRef([]);

  const columns = [
    { field: "name", headerName: "Artist", flex: 1, headerAlign: "center" },
  ];

  const paginationModel = { page: 0, pageSize: 50 };

  // Compute the initial rowSelectionModel based on clicked attribute
  const selectedIds = useMemo(() => {
    if (!availableArtists) return [];
    return availableArtists
      .filter((artist) => artist.clicked)
      .map((artist) => artist.id);
  }, [availableArtists]);

  return (
    <DialogRoot
      size="cover"
      placement="center"
      motionPreset="scale"
      closeOnEscape={false}
      closeOnInteractOutside={false}
      scrollBehavior={"inside"}
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
          {availableArtists == null ? (
            <Skeleton
              variant="shine"
              width="full"
              height="4"
              css={{
                "--start-color": "#FB5C74",
                "--end-color": "#FA233B",
              }}
            />
          ) : (
            <Paper sx={{ height: "100%", width: "100%" }}>
              <DataGrid
                rows={availableArtists}
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
            </Paper>
          )}
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}

export default ArtistDialog;