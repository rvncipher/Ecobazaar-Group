import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, Mail, User, Shield, ArrowLeft, Award, Edit2, Save, CheckCircle, XCircle } from 'lucide-react'
import Navbar from '../components/Navbar'

export default function Profile() {
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState('')
  const [ecoScore, setEcoScore] = useState(0)
  const [verified, setVerified] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const email = localStorage.getItem('userEmail')
    
    if (!token || !email) {
      navigate('/login')
      return
    }
    
    // Try to get from localStorage first
    const storedName = localStorage.getItem('userName')
    const storedRole = localStorage.getItem('userRole')
    const storedEcoScore = localStorage.getItem('userEcoScore')
    const storedVerified = localStorage.getItem('userVerified')
    
    if (storedName && storedRole) {
      setUserEmail(email)
      setUserName(storedName)
      setUserRole(storedRole)
      setEcoScore(parseInt(storedEcoScore) || 0)
      setVerified(storedVerified === 'true')
      setEditedName(storedName)
    } else {
      // Fetch from backend if not in localStorage
      fetchProfile(token)
    }
  }, [navigate])

  const fetchProfile = async (token) => {
    try {
      const response = await fetch('http://localhost:8080/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserEmail(data.email)
        setUserName(data.name)
        setUserRole(data.role)
        setEcoScore(data.ecoScore)
        setVerified(data.verified)
        setEditedName(data.name)
        
        // Update localStorage
        localStorage.setItem('userName', data.name)
        localStorage.setItem('userRole', data.role)
        localStorage.setItem('userEcoScore', data.ecoScore)
        localStorage.setItem('userVerified', data.verified)
      }
    } catch (err) {
      console.error('Failed to fetch profile')
    }
  }

  const handleUpdateName = async () => {
    if (!editedName.trim()) {
      setMessage('Name cannot be empty')
      return
    }
    
    setLoading(true)
    setMessage('')
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8080/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editedName })
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserName(data.name)
        localStorage.setItem('userName', data.name)
        setIsEditing(false)
        setMessage('Profile updated successfully!')
        setTimeout(() => setMessage(''), 3000)
      } else {
        const errorText = await response.text()
        console.error('Update failed:', response.status, errorText)
        setMessage(`Failed to update profile: ${response.status}`)
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setMessage('Error updating profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getUserInitial = () => {
    if (userName && userName.length > 0) {
      return userName.charAt(0).toUpperCase()
    }
    if (userEmail && userEmail.length > 0) {
      return userEmail.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getRoleDisplayName = () => {
    if (!userRole) return 'Standard User'
    switch(userRole.toUpperCase()) {
      case 'USER': return 'Standard User'
      case 'SELLER': return 'Seller Account'
      case 'ADMIN': return 'Administrator'
      default: return userRole
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white">
      {/* Navigation */}
      <Navbar />

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-linear-to-r from-green-500 to-green-600 p-8 text-white">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white text-green-600 rounded-full flex items-center justify-center font-bold text-4xl">
                {getUserInitial()}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">My Profile</h1>
                <p className="text-green-100">Manage your account information</p>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-8 space-y-6">
            {/* Name Section */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <User className="text-green-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-800">Full Name</h2>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-3 py-1 text-green-600 hover:bg-green-50 rounded transition"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                )}
              </div>
              {isEditing ? (
                <div className="ml-9 flex gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Enter your name"
                  />
                  <button
                    onClick={handleUpdateName}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <Save size={16} />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditedName(userName)
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="text-gray-700 text-lg ml-9">{userName || 'Not set'}</p>
              )}
            </div>

            {/* Email Section */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="text-green-600" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Email Address</h2>
              </div>
              <p className="text-gray-700 text-lg ml-9">{userEmail}</p>
            </div>

            {/* Account Type Section */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="text-green-600" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Account Type</h2>
              </div>
              <div className="ml-9 space-y-3">
                <p className="text-gray-700 text-lg">{getRoleDisplayName()}</p>
                
                {/* Verification Status for Sellers */}
                {userRole === 'SELLER' && (
                  <div className="flex items-center gap-2">
                    {verified ? (
                      <>
                        <CheckCircle className="text-green-600" size={20} />
                        <span className="text-green-700 font-medium">Verified Seller</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="text-amber-600" size={20} />
                        <span className="text-amber-700 font-medium">Pending Verification</span>
                      </>
                    )}
                  </div>
                )}
                
                {/* Pending verification message */}
                {userRole === 'SELLER' && !verified && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      Your seller account is pending admin approval. You will be able to list products once your account is verified.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Eco Score Section */}
            <div className="pb-6">
              <div className="flex items-center gap-3 mb-3">
                <Award className="text-green-600" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Eco Score</h2>
              </div>
              <div className="ml-9 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-bold text-green-600">{ecoScore}</span>
                  <span className="text-gray-500">points</span>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-3 max-w-xs">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(ecoScore, 100)}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-gray-500 text-sm ml-9 mt-2">
                Earn eco points by purchasing sustainable products
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
