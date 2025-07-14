import { useState, useEffect } from 'react';
import DropdownPortal from './DropdownPortal';
import './Sidebar.css';

function Sidebar({
  onNewChat,
  onLoadChat,
  chatList,
  activeChatId,
  onDeleteChat,
  onRenameChat, // ✅ Accept prop
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const toggleDropdown = (chatId, event) => {
    if (dropdownOpenId === chatId) {
      setDropdownOpenId(null);
      setDropdownPosition(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownOpenId(chatId);
      setDropdownPosition({
        top: rect.bottom + 10 + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  };

  const confirmDelete = (chatId) => {
    setChatToDelete(chatId);
    setDropdownOpenId(null);
    setDropdownPosition(null);
  };

  const handleDeleteConfirmed = () => {
    if (chatToDelete) {
      onDeleteChat(chatToDelete);
      setChatToDelete(null);
    }
  };

  const handleRename = (chatId) => {
    const chat = chatList.find((c) => c.id === chatId);
    if (chat) {
      setRenamingChatId(chatId);
      setRenameValue(chat.title || '');
      setDropdownOpenId(null);
      setDropdownPosition(null);
    }
  };

  const handleRenameSave = () => {
    if (renamingChatId && renameValue.trim()) {
      onRenameChat(renamingChatId, renameValue.trim()); // ✅ Proper update via store
    }
    setRenamingChatId(null);
  };

  const handleRenameKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameSave();
    } else if (e.key === 'Escape') {
      setRenamingChatId(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      if (dropdownOpenId) {
        setDropdownOpenId(null);
        setDropdownPosition(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpenId]);

  return (
    <>
      <div
        style={{
          width: collapsed ? '72px' : '260px',
          height: '100vh',
          background: '#0e0e0e',
          borderRight: '1px solid #222',
          padding: '1rem',
          position: 'fixed',
          top: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
          zIndex: 1000,
        }}
      >
        <div>
          <div className="d-flex align-items-center justify-content-between mb-4">
            {!collapsed && <h2 style={{ color: '#eaeaea', margin: 0 }}>Velari</h2>}
            <div className="flex-grow-1 d-flex justify-content-end">
              <button
                onClick={() => setCollapsed(!collapsed)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#aaa',
                  fontSize: '1.3rem',
                  cursor: 'pointer',
                }}
                aria-label="Toggle Sidebar"
                title="Toggle Sidebar"
              >
                <i className="bi bi-layout-sidebar"></i>
              </button>
            </div>
          </div>

          {!collapsed && (
            <>
              <button className="btn btn-outline-light w-100 mb-3" onClick={onNewChat}>
                + New Chat
              </button>

              <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {chatList.map((chat) => (
                  <div
                    key={chat.id}
                    className={`d-flex align-items-center position-relative mb-1 rounded transition ${
                      chat.id === activeChatId
                        ? 'bg-primary text-white'
                        : 'bg-dark text-light hover-glow'
                    }`}
                    style={{
                      padding: '0.5rem 0.75rem',
                      cursor: 'pointer',
                      transition: 'background 0.2s, box-shadow 0.2s',
                    }}
                    onClick={() => onLoadChat(chat.id)}
                    onDoubleClick={() => handleRename(chat.id)}
                  >
                    {renamingChatId === chat.id ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={handleRenameSave}
                        onKeyDown={handleRenameKey}
                        className="form-control form-control-sm me-2"
                        style={{
                          background: 'transparent',
                          color: '#fff',
                          borderColor: '#555',
                          maxWidth: '80%',
                        }}
                      />
                    ) : (
                      <div className="flex-grow-1 text-truncate">{chat.title || 'Untitled'}</div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDropdown(chat.id, e);
                      }}
                      className="btn btn-sm text-light px-1"
                      style={{ background: 'transparent' }}
                    >
                      <i className="bi bi-three-dots"></i>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {!collapsed && (
          <small style={{ color: '#666' }}>© {new Date().getFullYear()} Velari</small>
        )}

        {dropdownOpenId && dropdownPosition && (
          <DropdownPortal position={dropdownPosition}>
            <div
              style={{
                background: '#222',
                border: '1px solid #444',
                borderRadius: '4px',
                minWidth: '140px',
              }}
            >
              <button
                className="dropdown-item"
                onClick={() => handleRename(dropdownOpenId)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '8px 12px',
                  color: '#ccc',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                Rename
              </button>
              <button
                className="dropdown-item delete-hover"
                onClick={() => confirmDelete(dropdownOpenId)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ff6b6b',
                  padding: '8px 12px',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                Delete Chat
              </button>
            </div>
          </DropdownPortal>
        )}
      </div>

      {chatToDelete && (
        <div
          className="modal fade show"
          style={{
            display: 'block',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-light border border-secondary">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setChatToDelete(null)}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this chat?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setChatToDelete(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDeleteConfirmed}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
