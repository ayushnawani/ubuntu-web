import React, { useState, useEffect, useRef } from 'react';
import './style.css';

let currentTop = 0;
let currentLeft = 10;

function Draggable({ children, headerRef, defaultPostion, disabled }) {
  let prevClientX = 0,
    prevClientY = 0;

  let node = useRef(null);
  let accessNode = headerRef ? headerRef : node;

  const [position, setPosition] = useState(
    defaultPostion || {
      top: currentTop,
      left: currentLeft,
    }
  );

  function onMouseUp(params) {
    // console.log('MOUSE UP');
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('mousemove', onMouseMove);
  }

  function onMouseMove(e) {
    let rect = accessNode.current.getBoundingClientRect();

    let offsetLeft = rect.left;
    let offsetTop = rect.top;
    console.log('MOUSE MOVE OFS', offsetLeft, offsetTop);

    console.log('MOUSE MOVE PRE', prevClientX, prevClientY);
    console.log('MOUSE MOVE CUR', e.clientX, e.clientY);

    console.log('MOUSE MOVE POSITION', {
      top: offsetTop - (prevClientY - e.clientY),
      left: offsetLeft - (prevClientX - e.clientX),
    });

    e.preventDefault();
    // calculate the new cursor position:

    // set the element's new position:

    let newTop = offsetTop - (prevClientY - e.clientY);
    let newLeft = offsetLeft - (prevClientX - e.clientX);

    if (newTop < 0) {
      newTop = 0;
    }

    if (newTop >= window.innerHeight - accessNode.current.clientHeight) {
      newTop = window.innerHeight - accessNode.current.clientHeight;
    }

    if (newLeft < 0) {
      newLeft = 0;
    }

    if (newLeft > window.innerWidth - accessNode.current.clientWidth) {
      newLeft = window.innerWidth - accessNode.current.clientWidth;
    }

    setPosition({
      top: newTop,
      left: newLeft,
    });

    prevClientX = e.clientX;
    prevClientY = e.clientY;
  }

  function onMouseDown(e) {
    // console.log('MOUSE DOWN');
    e.preventDefault();
    // get the mouse cursor position at startup:
    prevClientX = e.clientX;
    prevClientY = e.clientY;

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mousemove', onMouseMove);
  }

  useEffect(() => {
    console.log('REF', headerRef);

    if (!disabled) {
      accessNode.current.addEventListener('mousedown', onMouseDown);
    }
    if (!defaultPostion) {
      if (currentTop + accessNode.current.clientHeight > window.innerHeight) {
        currentTop = 0;
        currentLeft += accessNode.current.clientWidth + 30;
      }

      setPosition({
        ...position,
        top: currentTop,
        left: currentLeft,
      });

      currentTop += accessNode.current.clientHeight;
    }
    return () => {
      console.log('UNMOUNT');
      if (!defaultPostion) {
        currentTop -= accessNode.current.clientHeight;
      }
      onMouseUp();
    };
  }, []);

  return (
    <div
      className="rn-draggable"
      style={{
        position: 'fixed',
        ...position,
      }}
      ref={node}
    >
      {children}
    </div>
  );
}

export default Draggable;
