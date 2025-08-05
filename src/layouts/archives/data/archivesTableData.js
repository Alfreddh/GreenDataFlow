/* eslint-disable react/prop-types */
/* eslint-disable react/function-component-definition */
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

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";

export default function data() {
  const Form = ({ title, description }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDBox ml={2} lineHeight={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {title}
        </MDTypography>
        <MDTypography variant="caption">{description}</MDTypography>
      </MDBox>
    </MDBox>
  );

  const Status = ({ status }) => (
    <MDBox ml={-1}>
      <MDBadge badgeContent={status} color="dark" variant="gradient" size="sm" />
    </MDBox>
  );

  return {
    columns: [
      { Header: "formulaire", accessor: "formulaire", width: "45%", align: "left" },
      { Header: "statut", accessor: "statut", align: "center" },
      { Header: "archivé le", accessor: "archived", align: "center" },
      { Header: "créé le", accessor: "created", align: "center" },
      { Header: "action", accessor: "action", align: "center" },
    ],

    rows: [
      {
        formulaire: (
          <Form title="Ancien formulaire de contact" description="Ancien formulaire remplacé" />
        ),
        statut: <Status status="Archivé" />,
        archived: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            15/03/18
          </MDTypography>
        ),
        created: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            23/04/17
          </MDTypography>
        ),
        action: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            Restaurer
          </MDTypography>
        ),
      },
      {
        formulaire: <Form title="Formulaire obsolète" description="Formulaire plus utilisé" />,
        statut: <Status status="Archivé" />,
        archived: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            10/01/19
          </MDTypography>
        ),
        created: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            11/01/18
          </MDTypography>
        ),
        action: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            Restaurer
          </MDTypography>
        ),
      },
      {
        formulaire: <Form title="Test formulaire" description="Formulaire de test archivé" />,
        statut: <Status status="Archivé" />,
        archived: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            19/09/17
          </MDTypography>
        ),
        created: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            19/09/16
          </MDTypography>
        ),
        action: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            Restaurer
          </MDTypography>
        ),
      },
      {
        formulaire: <Form title="Ancienne enquête" description="Enquête de satisfaction 2020" />,
        statut: <Status status="Archivé" />,
        archived: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            24/12/20
          </MDTypography>
        ),
        created: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            24/12/19
          </MDTypography>
        ),
        action: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            Restaurer
          </MDTypography>
        ),
      },
      {
        formulaire: (
          <Form title="Formulaire temporaire" description="Formulaire temporaire archivé" />
        ),
        statut: <Status status="Archivé" />,
        archived: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            04/10/21
          </MDTypography>
        ),
        created: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            04/10/20
          </MDTypography>
        ),
        action: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            Restaurer
          </MDTypography>
        ),
      },
    ],
  };
}
