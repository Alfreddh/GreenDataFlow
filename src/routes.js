/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

import { Navigate } from "react-router-dom";

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Formulaires from "layouts/formulaires";
import Archives from "layouts/archives";
import Deployes from "layouts/deployes";
import Groupes from "layouts/groupes";
import FormBuilder from "layouts/formulaire";
import Apercu from "layouts/formulaire/apercu";
import ProfilePage from "layouts/profile/ProfilePage";
import NotFound from "layouts/formulaire/NotFound";
import FormResponses from "layouts/formulaires/FormResponses";

// Auth components
import Login from "components/auth/Login";
import Register from "components/auth/Register";
import PrivateRoute from "components/auth/PrivateRoute";

// @mui icons
import Icon from "@mui/material/Icon";

const routes = [
  {
    type: "auth",
    name: "Login",
    key: "login",
    route: "/login",
    component: <Login />,
  },
  {
    type: "auth",
    name: "Register",
    key: "register",
    route: "/register",
    component: <Register />,
  },
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "Formulaires",
    key: "formulaires",
    icon: <Icon fontSize="small">description</Icon>,
    route: "/formulaires",
    component: (
      <PrivateRoute>
        <Formulaires />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "Archivés",
    key: "archives",
    icon: <Icon fontSize="small">archive</Icon>,
    route: "/archives",
    component: (
      <PrivateRoute>
        <Archives />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "Déployés",
    key: "deployes",
    icon: <Icon fontSize="small">publish</Icon>,
    route: "/deployes",
    component: (
      <PrivateRoute>
        <Deployes />
      </PrivateRoute>
    ),
  },
  {
    type: "collapse",
    name: "Groupes",
    key: "groupes",
    icon: <Icon fontSize="small">group</Icon>,
    route: "/groupes",
    component: (
      <PrivateRoute>
        <Groupes />
      </PrivateRoute>
    ),
  },
  // Route pour le formulaire (pas dans le menu)
  {
    type: "page",
    name: "Formulaire",
    key: "formulaire-page",
    route: "/formulaire",
    component: (
      <PrivateRoute>
        <FormBuilder />
      </PrivateRoute>
    ),
  },
  // Route pour l'affichage/édition d'un formulaire existant
  {
    type: "page",
    name: "Formulaire ID",
    key: "formulaire-id",
    route: "/formulaire/:formId",
    component: (
      <PrivateRoute>
        <FormBuilder />
      </PrivateRoute>
    ),
  },
  {
    type: "page",
    name: "Formulaire Public",
    key: "formulaire-public",
    route: "/form/:id",
    component: <Apercu />,
  },
  {
    type: "page",
    name: "Réponses du formulaire",
    key: "formulaire-reponses",
    route: "/formulaires/:formId/reponses",
    component: (
      <PrivateRoute>
        <FormResponses />
      </PrivateRoute>
    ),
  },
  {
    type: "page",
    name: "NotFound",
    key: "notfound",
    route: "*",
    component: <NotFound />,
  },
  {
    type: "collapse",
    name: "Profil",
    key: "profil",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profil",
    component: <ProfilePage />,
  },
  // Route par défaut
  {
    type: "redirect",
    route: "/",
    component: <Navigate to="/dashboard" />,
  },
];

export default routes;
