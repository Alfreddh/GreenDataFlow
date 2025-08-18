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
  Paper,
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
  const [modal, setModal] = useState({
    archive: false,
  });
  const [selectedForm, setSelectedForm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  // Cache global avec localStorage pour persister entre les navigations
  const CACHE_KEY_FORMS = "deployes_forms_cache";
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  // Fonction pour vérifier si le cache est valide
  const isCacheValid = (cacheData) => {
    if (!cacheData) return false;
    const now = Date.now();
    return cacheData.timestamp && now - cacheData.timestamp < CACHE_EXPIRY;
  };

  // Fonction pour sauvegarder en cache
  const saveToCache = (key, data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (e) {
      console.error("Erreur sauvegarde cache:", e);
    }
  };

  // Fonction pour récupérer du cache
  const getFromCache = (key) => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      if (isCacheValid(cacheData)) {
        return cacheData.data;
      } else {
        // Cache expiré, le supprimer
        localStorage.removeItem(key);
        return null;
      }
    } catch (e) {
      console.error("Erreur lecture cache:", e);
      return null;
    }
  };

  const fetchForms = async () => {
    // Vérifier si c'est un rechargement de page (F5)
    const isPageReload =
      performance.navigation.type === 1 ||
      (window.performance &&
        window.performance.getEntriesByType("navigation")[0]?.type === "reload");

    // Si c'est un rechargement, ignorer le cache et forcer le rechargement
    if (isPageReload) {
      console.log("Rechargement de page détecté - Forcer le rechargement des formulaires déployés");
      localStorage.removeItem(CACHE_KEY_FORMS);
    } else {
      // Vérifier le cache localStorage pour la navigation normale
      const cachedForms = getFromCache(CACHE_KEY_FORMS);
      if (cachedForms) {
        console.log("Utilisation du cache localStorage pour les formulaires déployés");
        setForms(cachedForms);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      let allForms = [];
      let nextUrl = null;

      // Récupérer tous les formulaires avec pagination
      do {
        const res = await formService.getAllForms(nextUrl);
        const formsData = res?.results?.data || res?.data || [];
        allForms = [...allForms, ...formsData];
        nextUrl = res?.next || null;
      } while (nextUrl);

      // Filtrer seulement les formulaires déployés
      const deployedForms = allForms.filter((f) => f.is_public);
      setForms(deployedForms);

      // Sauvegarder en cache localStorage seulement si ce n'est pas un rechargement
      if (!isPageReload) {
        saveToCache(CACHE_KEY_FORMS, deployedForms);
      }
    } catch (e) {
      console.error("Erreur lors du chargement des formulaires déployés:", e);
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

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
      // Invalidate cache after archiving
      localStorage.removeItem(CACHE_KEY_FORMS);
      setLoading(true); // Force re-fetch to update table
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
      {/* Styles CSS globaux pour les animations */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
          }
        `}
      </style>
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
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: "center",
                      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                      borderRadius: 3,
                      border: "2px dashed #ccc",
                      animation: "pulse 2s infinite",
                      mx: 2,
                      my: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <CircularProgress size={40} sx={{ color: "#77af0a" }} />
                      <MDTypography variant="h6" color="text.secondary">
                        Chargement des formulaires déployés...
                      </MDTypography>
                      <MDTypography variant="body2" color="text.secondary">
                        Veuillez patienter pendant que nous récupérons vos données
                      </MDTypography>
                    </Box>
                  </Paper>
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
