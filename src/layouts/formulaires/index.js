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
  const [cachedPages, setCachedPages] = useState({}); // Cache par page

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

  // Cache global avec localStorage pour persister entre les navigations
  const CACHE_KEY_FORMS = "formulaires_forms_cache";
  const CACHE_KEY_PAGINATION = "formulaires_pagination_cache";
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

  const fetchForms = async (page = 1, forceRefresh = false) => {
    // Vérifier si c'est un rechargement de page (F5)
    const isPageReload =
      performance.navigation.type === 1 ||
      (window.performance &&
        window.performance.getEntriesByType("navigation")[0]?.type === "reload");

    // Si c'est un rechargement, ignorer le cache et forcer le rechargement
    if (isPageReload) {
      console.log("Rechargement de page détecté - Forcer le rechargement des formulaires");
      localStorage.removeItem(CACHE_KEY_FORMS);
      localStorage.removeItem(CACHE_KEY_PAGINATION);
      setCachedPages({});
    } else {
      // Vérifier le cache localStorage pour la navigation normale
      const cachedForms = getFromCache(CACHE_KEY_FORMS);
      if (cachedForms && !forceRefresh && page === 1) {
        console.log("Utilisation du cache localStorage pour les formulaires (page 1)");
        setForms(cachedForms);
        setLoading(false);
        return;
      }

      // Vérifier le cache de pagination dans localStorage
      const cachedPagination = getFromCache(CACHE_KEY_PAGINATION);
      if (cachedPagination && !forceRefresh && cachedPagination[page]) {
        console.log(`Utilisation du cache localStorage pour la page ${page}`);
        setForms(cachedPagination[page].data);
        setNextPageUrl(cachedPagination[page].next);
        setPrevPageUrl(cachedPagination[page].previous);
        setTotalPages(cachedPagination[page].totalPages);
        setCurrentPage(page);
        setCachedPages(cachedPagination); // Restaurer le cache en mémoire
        return;
      }
    }

    // Vérifier le cache en mémoire pour cette page spécifique
    if (!forceRefresh && !isPageReload && cachedPages[page]) {
      console.log(`Utilisation du cache en mémoire pour la page ${page}`);
      setForms(cachedPages[page].data);
      setNextPageUrl(cachedPages[page].next);
      setPrevPageUrl(cachedPages[page].previous);
      setTotalPages(cachedPages[page].totalPages);
      setCurrentPage(page);
      return;
    }

    setLoading(true);
    try {
      // Construire l'URL avec le numéro de page
      const url = page > 1 ? `/collecte/forms/all?page=${page}` : null;
      const res = await formService.getAllForms(url);

      console.log(`API Response pour page ${page}:`, res);

      const formsData = res?.results?.data || res?.data || [];
      setForms(formsData);

      setNextPageUrl(res.next);
      setPrevPageUrl(res.previous);
      setTotalPages(res.total_pages || 1);
      setCurrentPage(page);

      // Mettre en cache cette page
      const newCachedPages = {
        ...cachedPages,
        [page]: {
          data: formsData,
          next: res.next,
          previous: res.previous,
          totalPages: res.total_pages || 1,
        },
      };
      setCachedPages(newCachedPages);

      setIsLoaded(true);

      // Sauvegarder en cache localStorage seulement si ce n'est pas un rechargement
      if (!isPageReload) {
        if (page === 1) {
          saveToCache(CACHE_KEY_FORMS, formsData);
        }
        // Sauvegarder le cache de pagination complet
        saveToCache(CACHE_KEY_PAGINATION, newCachedPages);
      }
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
      fetchForms(1);
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
        <Box
          onClick={() => navigate(`/formulaires/${f.id}/reponses`)}
          sx={{
            cursor: "pointer",
            p: 1.5,
            borderRadius: 2,
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            border: "2px solid transparent",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
              borderColor: "#77af0a",
              transform: "translateY(-2px)",
              boxShadow: "0 8px 25px rgba(119, 175, 10, 0.15)",
            },
            "&:active": {
              transform: "translateY(0px)",
            },
            display: "flex",
            alignItems: "center",
          }}
        >
          <MDTypography
            variant="button"
            fontWeight="600"
            sx={{
              color: "#1e293b",
              fontSize: "0.875rem",
              letterSpacing: "0.025em",
              maxWidth: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={f.title}
          >
            {f.title.length > 20 ? `${f.title.substring(0, 20)}...` : f.title}
          </MDTypography>
        </Box>
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
                  Formulaires
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
                        Chargement des formulaires...
                      </MDTypography>
                      <MDTypography variant="body2" color="text.secondary">
                        Veuillez patienter pendant que nous récupérons vos données
                      </MDTypography>
                    </Box>
                  </Paper>
                ) : (
                  <>
                    <DataTable
                      table={{ columns, rows }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                    {/* Pagination Moderne */}
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      mt={3}
                      mb={2}
                      sx={{
                        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                        borderRadius: 3,
                        p: 2,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        border: "1px solid #e0e7ef",
                      }}
                    >
                      {/* Bouton Précédent */}
                      <Button
                        variant="outlined"
                        disabled={currentPage === 1}
                        onClick={() => fetchForms(currentPage - 1)}
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          borderColor: currentPage === 1 ? "#ccc" : "#77af0a",
                          color: currentPage === 1 ? "#ccc" : "#77af0a",
                          "&:hover": {
                            borderColor: currentPage === 1 ? "#ccc" : "#5a8a08",
                            backgroundColor:
                              currentPage === 1 ? "transparent" : "rgba(119, 175, 10, 0.04)",
                          },
                          mr: 2,
                        }}
                      >
                        ← Précédent
                      </Button>

                      {/* Pages numérotées */}
                      <Box display="flex" gap={1} mx={2}>
                        {(() => {
                          const pages = [];
                          const maxVisiblePages = 5;
                          let startPage = Math.max(
                            1,
                            currentPage - Math.floor(maxVisiblePages / 2)
                          );
                          let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                          if (endPage - startPage + 1 < maxVisiblePages) {
                            startPage = Math.max(1, endPage - maxVisiblePages + 1);
                          }

                          // Première page
                          if (startPage > 1) {
                            pages.push(
                              <Button
                                key={1}
                                variant="outlined"
                                onClick={() => fetchForms(1)}
                                sx={{
                                  minWidth: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                  borderColor: "#e0e7ef",
                                  color: "#666",
                                  "&:hover": {
                                    borderColor: "#77af0a",
                                    backgroundColor: "rgba(119, 175, 10, 0.04)",
                                  },
                                }}
                              >
                                1
                              </Button>
                            );
                            if (startPage > 2) {
                              pages.push(
                                <Typography
                                  key="dots1"
                                  sx={{ px: 1, color: "#666", alignSelf: "center" }}
                                >
                                  ...
                                </Typography>
                              );
                            }
                          }

                          // Pages visibles
                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <Button
                                key={i}
                                variant={i === currentPage ? "contained" : "outlined"}
                                onClick={() => fetchForms(i)}
                                sx={{
                                  minWidth: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                  backgroundColor: i === currentPage ? "#77af0a" : "transparent",
                                  borderColor: i === currentPage ? "#77af0a" : "#e0e7ef",
                                  color: i === currentPage ? "#fff" : "#666",
                                  "&:hover": {
                                    backgroundColor:
                                      i === currentPage ? "#5a8a08" : "rgba(119, 175, 10, 0.04)",
                                    borderColor: "#77af0a",
                                  },
                                }}
                              >
                                {i}
                              </Button>
                            );
                          }

                          // Dernière page
                          if (endPage < totalPages) {
                            if (endPage < totalPages - 1) {
                              pages.push(
                                <Typography
                                  key="dots2"
                                  sx={{ px: 1, color: "#666", alignSelf: "center" }}
                                >
                                  ...
                                </Typography>
                              );
                            }
                            pages.push(
                              <Button
                                key={totalPages}
                                variant="outlined"
                                onClick={() => fetchForms(totalPages)}
                                sx={{
                                  minWidth: 40,
                                  height: 40,
                                  borderRadius: "50%",
                                  borderColor: "#e0e7ef",
                                  color: "#666",
                                  "&:hover": {
                                    borderColor: "#77af0a",
                                    backgroundColor: "rgba(119, 175, 10, 0.04)",
                                  },
                                }}
                              >
                                {totalPages}
                              </Button>
                            );
                          }

                          return pages;
                        })()}
                      </Box>

                      {/* Bouton Suivant */}
                      <Button
                        variant="outlined"
                        disabled={currentPage === totalPages}
                        onClick={() => fetchForms(currentPage + 1)}
                        sx={{
                          borderRadius: 2,
                          px: 3,
                          py: 1,
                          borderColor: currentPage === totalPages ? "#ccc" : "#77af0a",
                          color: currentPage === totalPages ? "#ccc" : "#77af0a",
                          "&:hover": {
                            borderColor: currentPage === totalPages ? "#ccc" : "#5a8a08",
                            backgroundColor:
                              currentPage === totalPages
                                ? "transparent"
                                : "rgba(119, 175, 10, 0.04)",
                          },
                          ml: 2,
                        }}
                      >
                        Suivant →
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
