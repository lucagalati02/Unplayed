import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from './pages/Landing.jsx'
import Unplayed from './pages/Unplayed.jsx'
import { useSelector } from 'react-redux'
import { Theme } from '@chakra-ui/react';

function App() {
  const isAuthenticated = useSelector(state => state.authentication.isAuthenticated)
  const theme = useSelector(state => state.theme.theme)

  return (
    <Theme appearance={theme}>
      <Router>
        <Routes>
          {/* Landing Page */}
          <Route path='/' element={isAuthenticated ? <Navigate to="/unplayed-home" /> : <Landing />} />

          {/* Unplayed Page */}
          <Route path='/unplayed-home' element={!isAuthenticated ? <Navigate to="/" /> : <Unplayed />} />
        </Routes>
      </Router>
    </Theme>
  )
}

export default App