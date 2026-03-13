import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Toast from './components/Toast'

import Home            from './screens/Home'
import AdminLogin      from './screens/AdminLogin'
import AdminParties    from './screens/AdminParties'
import AdminCreate     from './screens/AdminCreate'
import AdminDash       from './screens/AdminDash'
import PartyPage       from './screens/PartyPage'
import Register        from './screens/Register'
import Login           from './screens/Login'
import Dashboard       from './screens/Dashboard'
import GageHistory     from './screens/GageHistory'
import LeaderboardPage from './screens/Leaderboard'
import Podium          from './screens/Podium'
import SharePage       from './screens/SharePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                               element={<Home />} />
        <Route path="/admin/login"                    element={<AdminLogin />} />
        <Route path="/admin/parties"                  element={<AdminParties />} />
        <Route path="/admin/create"                   element={<AdminCreate />} />
        <Route path="/admin/dash/:partyId"            element={<AdminDash />} />
        <Route path="/party/:partyId"                 element={<PartyPage />} />
        <Route path="/party/:partyId/register"        element={<Register />} />
        <Route path="/party/:partyId/login"           element={<Login />} />
        <Route path="/dashboard/:partyId/:playerId"   element={<Dashboard />} />
        <Route path="/gages/:partyId/:playerId"        element={<GageHistory />} />
        <Route path="/leaderboard/:partyId"           element={<LeaderboardPage />} />
        <Route path="/podium/:partyId"                element={<Podium />} />
        <Route path="/share/:partyId"                 element={<SharePage />} />
        <Route path="*"                               element={<Navigate to="/" />} />
      </Routes>
      <Toast />
    </BrowserRouter>
  )
}
