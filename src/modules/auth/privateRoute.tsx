import React, { FunctionComponent } from "react";
import { Route, useLocation } from "react-router-dom";
import { useUserFacade } from "./hooks/user.hook";

const PrivateRoute = ({ component, exact, path}: 
  { component: FunctionComponent<{}>, exact: boolean, path: string }) => {

  const [] = useUserFacade();
  const location = useLocation();


  return (
      <Route path={path} component={component} exact={exact} />
  );
}





/*




const  PrivateRoute = ({ component: Component, ...rest }) => {

  const [authenticated] = useUserFacade();
  //const location = useLocation();

  //console.log(location);


  return (
    <Route
      {...rest}
      render={props =>
        authenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{ pathname: "/auth/login"}}
          />
        )
      }
    />
  );
}
*/
export default PrivateRoute;