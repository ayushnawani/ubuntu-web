import React, { useRef, useEffect, Fragment } from 'react';
import { ContextMenuTrigger } from 'react-contextmenu';
import ContextMenuItem from '../contextMenu';
import Draggable from '../draggable/draggable';
import './style.css';

function Modal(
  {
    isOpen,
    children,
    shouldCloseOnOverlayClick,
    onRequestClose,
    isDraggable,
    activeItem,
  },
  modalRef
) {
  let node = useRef(null);
  let headerRef = useRef(null);
  let aItem = activeItem || { id: 'MODAL' };

  function onClick(event) {
    if (event.target === node.current) {
      if (shouldCloseOnOverlayClick) {
        onClickClose(event);
      }
    }
  }
  function onClickClose(event) {
    onRequestClose(event);
  }

  useEffect(() => {
    window.addEventListener('click', onClick);

    return () => {
      window.removeEventListener('click', onClick);
    };
  }, [isOpen]);

  let Wrapper = isDraggable ? Draggable : Fragment;

  return (
    <div
      ref={node}
      style={{
        display: isOpen ? 'block' : 'none',
      }}
      className="rn-modal"
    >
      <Wrapper headerRef={headerRef} defaultPostion={{ top: 100, left: 100 }}>
        <ContextMenuTrigger id={aItem.id + 'MODAL'}>
          <div className="rn-modal-content">
            <div ref={headerRef} id="rn-modal-header">
              <div id="rn-close" onClick={onClickClose} />
            </div>
            <div ref={modalRef} className="rn-modal-body">
              {children}
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuItem type="MODAL" item={aItem} />
      </Wrapper>
    </div>
  );
}

export default React.forwardRef(Modal);
