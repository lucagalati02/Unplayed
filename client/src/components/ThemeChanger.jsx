import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changeTheme } from '../redux/theme';
import { SimpleGrid, Box, Center, VStack, Text, Highlight, Image, List, IconButton } from '@chakra-ui/react';
import { LuCircleCheck, LuSun, LuMoon } from "react-icons/lu"
import axios from 'axios'

function ThemeChanger() {
    const dispatch = useDispatch();
    const theme = useSelector(state => state.theme.theme);

    return (
    <Box height="10vh" position="relative">
        <IconButton position="absolute" top="0" right="0" m={2} rounded="full" variant='ghost' onClick={() => dispatch(changeTheme())}>
            {theme == "dark" ? <LuSun style={{color: 'yellow'}}/> : <LuMoon style={{color: 'purple'}}/>}
        </IconButton>
    </Box>
    )
}

export default ThemeChanger