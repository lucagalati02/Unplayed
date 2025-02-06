import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from './pages/Landing.jsx'
import Unplayed from './pages/Unplayed.jsx'
import { useSelector } from 'react-redux'
import { Theme } from '@chakra-ui/react';

function App() {
  const isSignedIn = useSelector(state => state.authentication.isSignedIn)
  const isAuthorized = useSelector(state => state.authentication.isAuthorized)
  const theme = useSelector(state => state.theme.theme)

  return (
    <Theme appearance={theme}>
      <Router>
        <Routes>
          {/* Landing Page */}
          <Route path='/' element={isAuthorized && isSignedIn ? <Navigate to="/unplayed-home" /> : <Landing />} />

          {/* Unplayed Page */}
          <Route path='/unplayed-home' element={!isAuthorized || !isSignedIn ? <Navigate to="/" /> : <Unplayed />} />
        </Routes>
      </Router>
    </Theme>
  )
}

export default App