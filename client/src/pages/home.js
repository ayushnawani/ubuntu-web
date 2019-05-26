import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gql } from 'apollo-boost';
import { useQuery, useMutation } from 'react-apollo-hooks';
import classNames from 'classnames';
// import Draggable from 'react-draggable';
// import ReactModal from 'react-modal';
import { ContextMenuTrigger } from 'react-contextmenu';
import Draggable from '../components/draggable/draggable';
import ContextMenuItem, { REMOVE_ITEM } from '../components/contextMenu';
import ReactModal from '../components/modal/modal';
import { GET_ITEM_QUERY } from '../App';

export const GET_FILES_FOLDERS = gql`
  query {
    baseFiles {
      id
      name
      parent
      selected @client
    }
    baseFolders {
      id
      name
      parent
      selected @client
    }
  }
`;

const ADD_FOLDER = gql`
  mutation AddFolder($name: String!, $parent: ID) {
    addFolder(name: $name, parent: $parent) {
      id
      name
      parent
    }
  }
`;

export const TOGGLE_ITEM = gql`
  mutation ToggleItem($id: ID) {
    toggleItem(id: $id) @client {
      id
    }
  }
`;

const ADD_FILE = gql`
  mutation AddFile($name: String!, $parent: ID) {
    addFile(name: $name, parent: $parent) {
      id
      name
      parent
    }
  }
`;

// const styleOverrides = {
//   overlay: {
//     display: 'flex',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'transparent',
//   },
//   content: {
//     bottom: 'unset',
//     overflow: 'visible',
//     padding: 0,
//     border: 'none',
//     borderRadius: 0,
//     position: 'static',
//     background: 'none',
//     pointerEvents: 'none',
//   },
// };

function Home() {
  const [modal, setModal] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const modalRef = useRef(null);

  const { data } = useQuery(GET_FILES_FOLDERS);
  const resData = useQuery(GET_ITEM_QUERY);
  const { items } = resData.data;

  console.log('RES', items);

  function showModal() {
    setModal(true);
  }

  function hideModal() {
    setActiveItem(null);
    setModal(false);
  }

  console.log('BASE DATA', data);
  let list = [];
  if (data && data.baseFiles) {
    list = [
      ...data.baseFiles.map(item => ({ ...item, type: 'FILE' })),
      ...data.baseFolders.map(item => ({ ...item, type: 'FOLDER' })),
      ...items,
    ];
  }

  return (
    <div id="home">
      {/* <ReactModal
        // overlayClassName="modal-overlay"
        style={styleOverrides}
        isOpen={modal}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick={false}
        onRequestClose={hideModal}
      >
        <Draggable handle=".handle" bounds="body">
          <div className="modal-header">
            <div className="handle" />
            <div className="modal-body">hi</div>
          </div>
        </Draggable>
      </ReactModal> */}

      <ReactModal
        isOpen={modal}
        isDraggable
        shouldCloseOnEsc
        shouldCloseOnOverlayClick={false}
        onRequestClose={hideModal}
        activeItem={activeItem}
        ref={modalRef}
      >
        <ul>
          {list
            .filter(item => activeItem && item.parent === activeItem.id)
            .map(item => {
              return (
                <ListItem
                  key={item.id}
                  showModal={showModal}
                  item={item}
                  setActiveItem={setActiveItem}
                  activeItem={activeItem}
                  modalRef={modalRef}
                />
              );
            })}
        </ul>
      </ReactModal>

      <ul>
        {list
          .filter(item => !item.parent)
          .map((item, index) => {
            return (
              <React.Fragment key={item.id}>
                <ContextMenuTrigger id={item.id}>
                  <Draggable
                    disabled={!item.name}

                    // onStop={e => {
                    //   console.log(e);
                    // }}
                  >
                    <ListItem
                      showModal={showModal}
                      item={item}
                      setActiveItem={setActiveItem}
                      activeItem={activeItem}
                      modalRef={modalRef}
                    />
                  </Draggable>
                </ContextMenuTrigger>
                <ContextMenuItem
                  type="LOCAL"
                  item={item}
                  showModal={showModal}
                />
              </React.Fragment>
            );
          })}
      </ul>
    </div>
  );
}

function ListItem({ showModal, item, setActiveItem, modalRef, activeItem }) {
  // console.log('ACTIVE', activeItem);
  const addFolder = useMutation(ADD_FOLDER, {
    refetchQueries: [{ query: GET_FILES_FOLDERS }],
  });
  const addFile = useMutation(ADD_FILE, {
    refetchQueries: [{ query: GET_FILES_FOLDERS }],
  });

  const toggleItem = useMutation(TOGGLE_ITEM, {
    variables: { id: item.id },
    // refetchQueries: [{ query: GET_FILES_FOLDERS }],
  });

  const removeProgressItem = useMutation(REMOVE_ITEM, {
    refetchQueries: [{ query: GET_ITEM_QUERY }],
  });
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState('');

  let image =
    item.type === 'FILE'
      ? require('../images/file-icon.png')
      : require('../images/folder-icon.png');

  function onMouseClick(event) {
    console.log(activeItem);
    if (item && event.target !== inputRef.current && inputValue) {
      console.log('YES MODAL', activeItem);

      if (item.type === 'FOLDER') {
        addFolder({
          variables: {
            name: inputValue || 'New Folder',
            parent: activeItem && activeItem.id,
          },
        });
      }
      if (item.type === 'FILE') {
        addFile({
          variables: {
            name: inputValue || 'New File',
            parent: activeItem && activeItem.id,
          },
        });
      }
      removeProgressItem({ variables: { id: item.id } });
      setInputValue('');
    }
  }

  useEffect(() => {
    if (item.type && !item.__typename) {
      window.addEventListener('click', onMouseClick);

      return () => {
        window.removeEventListener('click', onMouseClick);
      };
    }
  }, [item, inputValue, activeItem]);

  function onChangeInput(e) {
    console.log(e.target.value);
    setInputValue(e.target.value);
  }

  const itemClass = classNames({
    'home-item': true,
    'home-item--selected': item.selected,
  });

  function toggleSelect() {
    toggleItem();
  }

  return (
    <li
      className={itemClass}
      onClick={toggleSelect}
      onDoubleClick={() => {
        showModal();
        setActiveItem(item);
      }}
    >
      <img draggable={false} className="item-image" alt="file" src={image} />
      {item.name ? (
        <div className="item-text">{item.name}</div>
      ) : (
        <input
          ref={inputRef}
          value={inputValue}
          className="item-input"
          type="text"
          onChange={onChangeInput}
        />
      )}
    </li>
  );
}

// ReactModal.setAppElement('body');

export default Home;
