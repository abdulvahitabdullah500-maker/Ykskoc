import React from 'react';

export const NavContext = React.createContext({
  push: () => {},
  pop: () => {},
  replace: () => {},
  reset: () => {},
  canGoBack: false,
});

export const useNav = () => React.useContext(NavContext);
