import { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const { user } = useAuth();
  const auth = getAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google login failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const userInitial = user?.displayName?.charAt(0)?.toUpperCase() || 'G';

  return (
    <div style={{ position: 'fixed', top: 20, right: 20 }} ref={ref}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: '#333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          overflow: 'hidden',
        }}
        title={user ? user.email || user.displayName : 'Guest'}
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt="avatar"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ color: '#aaa', fontSize: '1.2rem' }}>{userInitial}</span>
        )}
      </div>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 50,
            background: '#1a1a1a',
            color: '#fff',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0,0,0,0.4)',
            width: '220px',
            zIndex: 1000,
            fontSize: '0.9rem',
          }}
        >
          <div className="p-3 border-bottom" style={{ color: '#aaa' }}>
            Signed in as{' '}
            <strong>{user ? user.displayName || user.email : 'Guest'}</strong>
          </div>

          {!user ? (
            <>
              <button
                className="btn btn-outline-light m-2"
                onClick={handleGoogleLogin}
              >
                Sign in with Google
              </button>
              <div className="px-3 pb-3 text-muted" style={{ fontSize: '0.8rem' }}>
                Login to save chats & personalize.
              </div>
            </>
          ) : (
            <>
              <div className="p-2 border-bottom">Export Chat</div>
              <div className="p-2 border-bottom">Settings</div>
              <div className="p-2 text-danger border-top" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                Sign out
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
