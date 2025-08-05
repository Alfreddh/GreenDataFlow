import React, { useEffect, useState } from "react";
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
  Snackbar,
  TextField,
  Avatar,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
} from "@mui/material";
import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";
import PublicIcon from "@mui/icons-material/Public";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/PersonAdd";
import MuiAlert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import { formService } from "../../services/api";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SecurityIcon from "@mui/icons-material/Security";
import PersonIcon from "@mui/icons-material/Person";

function getFormStatus(form) {
  if (form.is_archive) return "Archivé";
  if (form.is_public) return "Actif";
  return "Brouillon";
}

const PERMISSIONS = [
  {
    label: "Afficher le formulaire",
    value: "READ_PERMISSION",
    icon: <VisibilityIcon sx={{ fontSize: 44 }} />,
  },
  {
    label: "Modifier le formulaire",
    value: "MODIFY_PERMISSION",
    icon: <EditIcon sx={{ fontSize: 44 }} />,
  },
  {
    label: "Gérer le formulaire",
    value: "CONTROLLER_PERMISSION",
    icon: <SecurityIcon sx={{ fontSize: 44 }} />,
  },
  {
    label: "Agent du formulaire",
    value: "AGENT_PERMISSION",
    icon: <PersonIcon sx={{ fontSize: 44 }} />,
  },
];

const currentUser = { name: "alfredbdh", role: "propriétaire" };
const otherUsersMock = [
  { name: "jean.dupont", role: "agent", permissions: ["READ_PERMISSION", "AGENT_PERMISSION"] },
];

function Formulaires() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [modal, setModal] = useState({ archive: false, publish: false });
  const [selectedForm, setSelectedForm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [prevPageUrl, setPrevPageUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();
  const [addUserModal, setAddUserModal] = useState({ open: false, formId: null });
  const [addUserEmail, setAddUserEmail] = useState("");
  const [addUserName, setAddUserName] = useState("");
  const [addUserPerms, setAddUserPerms] = useState("");
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserNotif, setAddUserNotif] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchForms = async (url = null) => {
    setLoading(true);
    try {
      let res;
      if (url) {
        res = await formService.getAllForms(url);
      } else {
        res = await formService.getAllForms();
      }

      // Debug: afficher la structure de la réponse
      console.log("API Response:", res);

      // La structure correcte dépend de l'API
      // Si res.results existe, utiliser res.results.data
      // Sinon, utiliser res.data directement
      const formsData = res?.results?.data || res?.data || [];
      setForms(formsData);

      setNextPageUrl(res.next);
      setPrevPageUrl(res.previous);
      setTotalPages(res.total_pages || 1);
      if (res.next) {
        const match = res.next.match(/page=(\d+)/);
        setCurrentPage(match ? parseInt(match[1], 10) - 1 : 1);
      } else if (res.previous) {
        const match = res.previous.match(/page=(\d+)/);
        setCurrentPage(match ? parseInt(match[1], 10) + 1 : totalPages);
      } else {
        setCurrentPage(1);
      }
      setIsLoaded(true);
    } catch (e) {
      console.error("Erreur fetchForms:", e);
      setForms([]);
      setNextPageUrl(null);
      setPrevPageUrl(null);
      setTotalPages(1);
      setCurrentPage(1);
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
  // Publier
  const handlePublish = async () => {
    if (!selectedForm) return;
    setActionLoading(true);
    try {
      await formService.updateFormStatus(selectedForm.id, { is_public: true });
      setIsLoaded(false);
      closeModal("publish");
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
  const rows = forms.map((f) => {
    const status = getFormStatus(f);
    return {
      title: (
        <MDTypography
          variant="button"
          fontWeight="medium"
          sx={{ cursor: "pointer", textDecoration: "underline" }}
          onClick={() => navigate(`/formulaires/${f.id}/reponses`)}
        >
          {f.title}
        </MDTypography>
      ),
      group: (
        <MDTypography variant="caption" color="text">
          {f.group ? f.group.name : "Aucun"}
        </MDTypography>
      ),
      status: (
        <MDTypography
          variant="caption"
          color={status === "Archivé" ? "error" : status === "Actif" ? "success" : "warning"}
          fontWeight="medium"
        >
          {status}
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
              <IconButton
                color="error"
                size="small"
                disabled={f.is_archive}
                onClick={() => openModal("archive", f)}
              >
                <ArchiveIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Publier">
            <span>
              <IconButton
                color="primary"
                size="small"
                disabled={f.is_public || f.is_archive}
                onClick={() => openModal("publish", f)}
              >
                <PublicIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Modifier">
            <span>
              <IconButton
                color="info"
                size="small"
                disabled={f.is_archive}
                onClick={() =>
                  window.open(`${window.location.origin}/formulaire/${f.id}`, "_blank")
                }
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Ajouter utilisateur">
            <span>
              <IconButton
                color="primary"
                size="small"
                onClick={() => setAddUserModal({ open: true, formId: f.id })}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ),
    };
  });

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
                  Formulaires
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" py={5}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <DataTable
                      table={{ columns, rows }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                    {/* Pagination */}
                    <Box display="flex" justifyContent="center" alignItems="center" mt={2} gap={2}>
                      <Button
                        variant="outlined"
                        disabled={!prevPageUrl}
                        onClick={() => fetchForms(prevPageUrl)}
                      >
                        Précédent
                      </Button>
                      <Typography>
                        Page {currentPage} / {totalPages}
                      </Typography>
                      <Button
                        variant="outlined"
                        disabled={!nextPageUrl}
                        onClick={() => fetchForms(nextPageUrl)}
                      >
                        Suivant
                      </Button>
                    </Box>
                  </>
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      {/* Modal d'ajout d'agent */}
      <Dialog
        open={addUserModal.open}
        onClose={() => setAddUserModal({ open: false, formId: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: 8,
            background: "#f8fafc",
            p: 0,
            overflow: "visible",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: 26,
            textAlign: "left",
            letterSpacing: 0.5,
            pt: 4,
            pb: 1,
            color: "#222",
            px: 4,
          }}
        >
          Ajouter un agent
        </DialogTitle>
        <Typography variant="body2" sx={{ textAlign: "left", color: "#666", mb: 2, px: 4 }}>
          Saisis l&apos;email de l&apos;agent et choisis le rôle à lui attribuer.
        </Typography>
        <DialogContent sx={{ pb: 4, pt: 0, mt: 3 }}>
          <TextField
            label="Email de l'agent"
            value={addUserEmail}
            onChange={(e) => setAddUserEmail(e.target.value)}
            fullWidth
            sx={{ mb: 3, background: "#fff", borderRadius: 2 }}
          />
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: "#222" }}>
            Permission
          </Typography>
          <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={2} mb={2}>
            {PERMISSIONS.map((perm) => {
              const selected = addUserPerms === perm.value;
              return (
                <Paper
                  key={perm.value}
                  onClick={() => setAddUserPerms(perm.value)}
                  sx={{
                    p: 2.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    borderRadius: 3,
                    border: selected ? "2.5px solid #77af0a" : "2px solid #e0e7ef",
                    boxShadow: selected ? "0 8px 25px rgba(119, 175, 10, 0.10)" : 2,
                    background: selected
                      ? "linear-gradient(135deg, #f5f7fa 0%, #e8fbe8 100%)"
                      : "#fff",
                    cursor: "pointer",
                    transition: "all 0.18s",
                    "&:hover": {
                      borderColor: "#77af0a",
                      background: "linear-gradient(135deg, #f5f7fa 0%, #e8fbe8 100%)",
                      boxShadow: 6,
                      transform: "translateY(-2px) scale(1.03)",
                    },
                  }}
                  elevation={selected ? 6 : 1}
                >
                  <Box
                    sx={{
                      color: selected ? "#77af0a" : "#bdbdbd",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 40,
                    }}
                  >
                    {perm.icon}
                  </Box>
                  <Box flex={1}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: selected ? "#222" : "#555", fontSize: 17 }}
                    >
                      {perm.label}
                    </Typography>
                  </Box>
                  <Radio
                    checked={selected}
                    value={perm.value}
                    sx={{ color: "#77af0a" }}
                    tabIndex={-1}
                    inputProps={{ "aria-label": perm.label }}
                  />
                </Paper>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, gap: 1 }}>
          <Button
            onClick={() => setAddUserModal({ open: false, formId: null })}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 4,
              borderColor: "#d32f2f",
              color: "#d32f2f",
              "&:hover": {
                borderColor: "#b71c1c",
                backgroundColor: "rgba(211, 47, 47, 0.04)",
              },
            }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 4,
              background: "#77af0a",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#5a8a08",
              },
            }}
            disabled={addUserLoading || !addUserEmail || !addUserPerms}
            onClick={async () => {
              setAddUserLoading(true);
              try {
                await formService.assignFormPermission({
                  form: addUserModal.formId,
                  email: addUserEmail,
                  permission: addUserPerms,
                });
                setAddUserNotif({
                  open: true,
                  message: "Agent ajouté avec succès !",
                  severity: "success",
                });
                setAddUserModal({ open: false, formId: null });
                setAddUserEmail("");
                setAddUserPerms("");
              } catch (e) {
                setAddUserNotif({
                  open: true,
                  message: e?.response?.data?.message || "Erreur lors de l'ajout de l'agent.",
                  severity: "error",
                });
              }
              setAddUserLoading(false);
            }}
          >
            {addUserLoading ? <CircularProgress size={20} color="inherit" /> : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={addUserNotif.open}
        autoHideDuration={4000}
        onClose={() => setAddUserNotif((n) => ({ ...n, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert
          onClose={() => setAddUserNotif((n) => ({ ...n, open: false }))}
          severity={addUserNotif.severity}
          sx={{ width: "100%" }}
        >
          {addUserNotif.message}
        </MuiAlert>
      </Snackbar>
      <Footer />
    </DashboardLayout>
  );
}

export default Formulaires;
