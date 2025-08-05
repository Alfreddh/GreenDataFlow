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
  const Group = ({ name, description }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <MDBox ml={2} lineHeight={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {name}
        </MDTypography>
        <MDTypography variant="caption">{description}</MDTypography>
      </MDBox>
    </MDBox>
  );

  const Status = ({ status }) => (
    <MDBox ml={-1}>
      <MDBadge
        badgeContent={status}
        color={status === "Actif" ? "success" : "warning"}
        variant="gradient"
        size="sm"
      />
    </MDBox>
  );

  return {
    columns: [
      { Header: "groupe", accessor: "groupe", width: "45%", align: "left" },
      { Header: "statut", accessor: "statut", align: "center" },
      { Header: "membres", accessor: "membres", align: "center" },
      { Header: "créé le", accessor: "created", align: "center" },
      { Header: "action", accessor: "action", align: "center" },
    ],

    rows: [
      {
        groupe: (
          <Group name="Équipe Marketing" description="Groupe pour les formulaires marketing" />
        ),
        statut: <Status status="Actif" />,
        membres: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            8
          </MDTypography>
        ),
        created: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            23/04/18
          </MDTypography>
        ),
        action: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            Gérer
          </MDTypography>
        ),
      },
      {
        groupe: <Group name="Équipe Ventes" description="Groupe pour les formulaires de vente" />,
        statut: <Status status="Actif" />,
        membres: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            12
          </MDTypography>
        ),
        created: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            11/01/19
          </MDTypography>
        ),
        action: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            Gérer
          </MDTypography>
        ),
      },
      {
        groupe: (
          <Group name="Équipe Support" description="Groupe pour les formulaires de support" />
        ),
        statut: <Status status="Actif" />,
        membres: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            6
          </MDTypography>
        ),
        created: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            19/09/17
          </MDTypography>
        ),
        action: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            Gérer
          </MDTypography>
        ),
      },
      {
        groupe: <Group name="Équipe RH" description="Groupe pour les formulaires RH" />,
        statut: <Status status="Actif" />,
        membres: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            4
          </MDTypography>
        ),
        created: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            24/12/08
          </MDTypography>
        ),
        action: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            Gérer
          </MDTypography>
        ),
      },
      {
        groupe: <Group name="Équipe IT" description="Groupe pour les formulaires IT" />,
        statut: <Status status="Actif" />,
        membres: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            10
          </MDTypography>
        ),
        created: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            04/10/21
          </MDTypography>
        ),
        action: (
          <MDTypography component="a" href="#" variant="caption" color="text" fontWeight="medium">
            Gérer
          </MDTypography>
        ),
      },
    ],
  };
}
