import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import './App.css'
import Profile from './pages/Profile'
import Tasks from './pages/Tasks'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="topbar">
          <nav className="tabs">
            <NavLink to="/profile" className={({isActive}) => isActive ? 'tab active' : 'tab'}>Profile</NavLink>
            <NavLink to="/tasks" className={({isActive}) => isActive ? 'tab active' : 'tab'}>Tasks Management</NavLink>
            <NavLink to="/login" className={({isActive}) => isActive ? 'tab active' : 'tab'}>Login</NavLink>
            <NavLink to="/register" className={({isActive}) => isActive ? 'tab active' : 'tab'}>Register</NavLink>
          </nav>
        </header>
        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/profile" replace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/profile" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
