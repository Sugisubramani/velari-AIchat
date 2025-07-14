import { createPortal } from 'react-dom';

function DropdownPortal({ children, position }) {
  if (!position) return null;

  const style = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    zIndex: 9999,
  };

  return createPortal(
    <div style={style}>
      {children}
    </div>,
    document.body
  );
}

export default DropdownPortal;
