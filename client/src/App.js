import React from 'react';
import { ApolloProvider } from 'react-apollo-hooks';
import gql from 'graphql-tag';
import ApolloClient, { InMemoryCache } from 'apollo-boost';
import { Route, Switch, BrowserRouter, Redirect } from 'react-router-dom';
import { ContextMenuTrigger } from 'react-contextmenu';

import Home, { GET_FILES_FOLDERS } from './pages/home';
import Login from './pages/login';
import './App.css';
import ContextMenuItem from './components/contextMenu';

export const cache = new InMemoryCache();

export const ITEM_FRAGMENT = gql`
  fragment items on Items {
    items @client
  }
`;

export const GET_ITEM_QUERY = gql`
  query GetItems {
    items @client
  }
`;

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache,
  resolvers: {
    File: {
      selected: file => file.selected || false,
    },
    Folder: {
      selected: folder => folder.selected || false,
    },

    Mutation: {
      toggleItem: (_root, variables, { cache, getCacheKey }) => {
        // Fragment
        // const id = getCacheKey({ id: variables.id, __typename: 'Book' });
        // const fragment = gql`
        //   fragment bookToSelect on Book {
        //     selected
        //   }
        // `;

        // const book = cache.readFragment({ fragment, id });
        // const data = { ...book, selected: !book.selected };
        // cache.writeFragment({ fragment, id, data });

        // Query
        let { baseFiles, baseFolders } = cache.readQuery({
          query: GET_FILES_FOLDERS,
        });

        baseFiles = baseFiles.map(file => {
          if (file.id === variables.id) {
            return { ...file, selected: true };
          }
          return { ...file, selected: false };
        });

        baseFolders = baseFolders.map(folder => {
          if (folder.id === variables.id) {
            return { ...folder, selected: true };
          }
          return { ...folder, selected: false };
        });

        cache.writeQuery({
          query: GET_FILES_FOLDERS,
          data: {
            baseFiles,
            baseFolders,
          },
        });
        return null;
      },
      addProgressItem: (_root, { type, id, parent }, { cache }) => {
        const { items } = cache.readQuery({ query: GET_ITEM_QUERY });
        const itemsData = [...items, { type, id, parent }];
        cache.writeQuery({
          query: GET_ITEM_QUERY,
          data: {
            items: itemsData,
          },
        });
      },
      removeProgressItem: (_root, { id }, { cache }) => {
        const { items } = cache.readQuery({ query: GET_ITEM_QUERY });
        const itemsData = items.filter(item => item.id !== id);
        cache.writeQuery({
          query: GET_ITEM_QUERY,
          data: {
            items: itemsData,
          },
        });
      },
    },
  },
});

cache.writeData({
  data: {
    items: [],
    __typename: 'ProgressItems',
  },
});

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <ContextMenuTrigger id="GLOBAL">
          <Router />
        </ContextMenuTrigger>
        <ContextMenuItem
          type="GLOBAL"
          item={{ id: 'GLOBAL', type: 'GLOBAL' }}
        />
      </div>
    </ApolloProvider>
  );
}

function Router() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/home" component={Home} />
        <Redirect to="/home" />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
