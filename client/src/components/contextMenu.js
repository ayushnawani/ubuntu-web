import { ContextMenu, MenuItem } from 'react-contextmenu';
import React from 'react';
import './style.css';
import { GET_ITEM_QUERY } from '../App';
import { useMutation } from 'react-apollo-hooks';
import gql from 'graphql-tag';
import shortid from 'shortid';
import { GET_FILES_FOLDERS, TOGGLE_ITEM } from '../pages/home';

export const ADD_ITEM = gql`
  mutation AddItem($type: String!, $id: String!, $parent: String) {
    addProgressItem(type: $type, id: $id, parent: $parent) @client
  }
`;
export const REMOVE_ITEM = gql`
  mutation RemoveItem($id: String!) {
    removeProgressItem(id: $id) @client
  }
`;

export const DELETE_REMOTE_ITEM = gql`
  mutation delete($id: ID!, $type: String!) {
    delete(id: $id, type: $type)
  }
`;

function handleClick(e, data, addProgressItem, item = { id: null }) {
  if (data.type) {
    addProgressItem({
      variables: {
        type: data.type,
        id: shortid.generate(),
        parent: !['GLOBAL', 'LOCAL'].includes(item.id) ? item.id : null,
      },
    });
  }
}

function handleDelete({ id, type }, deleteRemoteItem) {
  console.log('DELETING', id, type);
  deleteRemoteItem({ variables: { id, type } });
}

function ContextMenuItem({ type, item, showModal }) {
  let addProgressItem = useMutation(ADD_ITEM, {
    refetchQueries: [{ query: GET_ITEM_QUERY }],
  });
  let toggleItem = useMutation(TOGGLE_ITEM, {
    variables: { id: item.id },
    // refetchQueries: [{ query: GET_ITEM_QUERY }],
  });
  let deleteRemoteItem = useMutation(DELETE_REMOTE_ITEM, {
    refetchQueries: [{ query: GET_FILES_FOLDERS }],
  });
  return (
    <ContextMenu
      id={type === 'MODAL' ? item.id + type : item.id}
      onShow={() => {
        if (type === 'LOCAL') {
          toggleItem();
        }
      }}
    >
      {type === 'LOCAL' && (
        <MenuItem data={{ foo: 'bar' }} onClick={showModal}>
          Open
        </MenuItem>
      )}
      {type === 'LOCAL' && (
        <MenuItem
          data={{ foo: 'bar' }}
          onClick={handleDelete.bind(this, item, deleteRemoteItem)}
        >
          Copy
        </MenuItem>
      )}
      {type === 'LOCAL' && (
        <MenuItem
          data={{ foo: 'bar' }}
          onClick={handleDelete.bind(this, item, deleteRemoteItem)}
        >
          Cut
        </MenuItem>
      )}
      {type !== 'LOCAL' && (
        <MenuItem
          data={{ type: 'FOLDER' }}
          onClick={(e, data) => handleClick(e, data, addProgressItem, item)}
        >
          New Folder
        </MenuItem>
      )}
      {type !== 'LOCAL' && (
        <MenuItem
          data={{ type: 'FILE' }}
          onClick={(e, data) => handleClick(e, data, addProgressItem, item)}
        >
          New Document
        </MenuItem>
      )}
      {type === 'GLOBAL' && (
        <MenuItem data={{ type: 'REFRESH' }} onClick={(e, data) => {}}>
          Refresh
        </MenuItem>
      )}
      {type === 'LOCAL' && (
        <MenuItem
          data={{ foo: 'bar' }}
          onClick={handleDelete.bind(this, item, deleteRemoteItem)}
        >
          Delete
        </MenuItem>
      )}
    </ContextMenu>
  );
}

export default ContextMenuItem;
