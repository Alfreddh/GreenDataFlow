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
      <MDBadge
        badgeContent={status}
        color={status === "En ligne" ? "success" : "warning"}
        variant="gradient"
        size="sm"
      />
    </MDBox>
  );

  return {
    columns: [
      { Header: "formulaire", accessor: "formulaire", width: "45%", align: "left" },
      { Header: "statut", accessor: "statut", align: "center" },
      { Header: "déployé le", accessor: "deployed", align: "center" },
      { Header: "réponses", accessor: "responses", align: "center" },
      { Header: "action", accessor: "action", align: "center" },
    ],

    rows: [
      {
        formulaire: (
          <Form
            title="Enquête satisfaction client"
            description="Formulaire de satisfaction client"
          />
        ),
        statut: <Status status="En ligne" />,
        deployed: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            23/04/18
          </MDTypography>
        ),
        responses: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            156
          </MDTypography>
        ),
        action: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            Voir
          </MDTypography>
        ),
      },
      {
        formulaire: (
          <Form
            title="Inscription newsletter"
            description="Formulaire d'inscription à la newsletter"
          />
        ),
        statut: <Status status="En ligne" />,
        deployed: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            11/01/19
          </MDTypography>
        ),
        responses: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            89
          </MDTypography>
        ),
        action: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            Voir
          </MDTypography>
        ),
      },
      {
        formulaire: (
          <Form title="Réservation événement" description="Formulaire de réservation d'événement" />
        ),
        statut: <Status status="En ligne" />,
        deployed: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            19/09/17
          </MDTypography>
        ),
        responses: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            234
          </MDTypography>
        ),
        action: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            Voir
          </MDTypography>
        ),
      },
      {
        formulaire: (
          <Form title="Formulaire de contact" description="Formulaire de contact général" />
        ),
        statut: <Status status="En ligne" />,
        deployed: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            24/12/08
          </MDTypography>
        ),
        responses: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            67
          </MDTypography>
        ),
        action: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            Voir
          </MDTypography>
        ),
      },
      {
        formulaire: <Form title="Demande de devis" description="Formulaire de demande de devis" />,
        statut: <Status status="En ligne" />,
        deployed: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            04/10/21
          </MDTypography>
        ),
        responses: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            45
          </MDTypography>
        ),
        action: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            Voir
          </MDTypography>
        ),
      },
    ],
  };
}
