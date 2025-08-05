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

import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Tooltip,
  Box,
  Typography,
} from "@mui/material";
import ArchiveIcon from "@mui/icons-material/Archive";
import PublicIcon from "@mui/icons-material/Public";
import EditIcon from "@mui/icons-material/Edit";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import { formService } from "../../services/api";
import { useNavigate } from "react-router-dom";

function Deployes() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [modal, setModal] = useState({
    archive: false,
  });
  const [selectedForm, setSelectedForm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchForms = async () => {
    setLoading(true);
    try {
      const data = await formService.getAllForms();
      setForms((data || []).filter((f) => f.is_public));
      setIsLoaded(true);
    } catch (e) {
      setForms([]);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (!isLoaded) {
      fetchForms();
    }
  }, [isLoaded]);

  // Ouvrir/fermer modals
  const openModal = (type, form = null) => {
    setModal((m) => ({ ...m, [type]: true }));
    setSelectedForm(form);
  };
  const closeModal = (type) => {
    setModal((m) => ({ ...m, [type]: false }));
    setSelectedForm(null);
  };

  // Archiver
  const handleArchive = async () => {
    if (!selectedForm) return;
    setActionLoading(true);
    try {
      await formService.updateFormStatus(selectedForm.id, { is_archive: true });
      setIsLoaded(false);
      closeModal("archive");
    } catch (e) {}
    setActionLoading(false);
  };

  // Colonnes du tableau
  const columns = [
    { Header: "Titre", accessor: "title", width: "30%", align: "left" },
    { Header: "Groupe", accessor: "group", align: "center" },
    { Header: "Statut", accessor: "status", align: "center" },
    { Header: "Créé le", accessor: "created_at", align: "center" },
    { Header: "Actions", accessor: "actions", align: "center" },
  ];

  // Lignes du tableau
  const rows = forms.map((f) => ({
    title: (
      <MDTypography variant="button" fontWeight="medium">
        {f.title}
      </MDTypography>
    ),
    group: (
      <MDTypography variant="caption" color="text" fontWeight="medium">
        {Array.isArray(f.groups) && f.groups.length > 0 ? f.groups[0].name : "Néant"}
      </MDTypography>
    ),
    status: (
      <MDTypography variant="caption" color="success" fontWeight="medium">
        Actif
      </MDTypography>
    ),
    created_at: (
      <MDTypography variant="caption" color="text">
        {new Date(f.created_at).toLocaleDateString()}
      </MDTypography>
    ),
    actions: (
      <Box display="flex" justifyContent="center" gap={1}>
        <Tooltip title="Archiver">
          <span>
            <IconButton color="error" onClick={() => openModal("archive", f)}>
              <ArchiveIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Publier">
          <span>
            <IconButton color="primary" disabled>
              <PublicIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Modifier">
          <span>
            <IconButton
              color="info"
              size="small"
              onClick={() => window.open(`${window.location.origin}/formulaire/${f.id}`, "_blank")}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    ),
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Formulaires déployés
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" py={5}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage={false}
                    showTotalEntries={false}
                    noEndBorder
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Modal Archiver */}
      <Dialog open={modal.archive} onClose={() => closeModal("archive")} maxWidth="xs" fullWidth>
        <DialogTitle>Archiver le formulaire</DialogTitle>
        <DialogContent>
          <Typography>Voulez-vous vraiment archiver ce formulaire ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeModal("archive")} disabled={actionLoading}>
            Annuler
          </Button>
          <Button
            onClick={handleArchive}
            variant="contained"
            color="error"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : "Archiver"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Deployes;
