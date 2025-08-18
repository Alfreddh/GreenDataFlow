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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Icon,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import { formService, groupService } from "../../services/api";

function Groupes() {
  const [groups, setGroups] = useState([]);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({
    create: false,
    edit: false,
    delete: false,
    addForm: false,
  });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedForm, setSelectedForm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [viewGroupForms, setViewGroupForms] = useState({ open: false, group: null, forms: [] });
  const [removeFormDialog, setRemoveFormDialog] = useState({
    open: false,
    form: null,
    group: null,
  });

  // Cache global avec localStorage pour persister entre les navigations
  const CACHE_KEY_GROUPS = "groupes_groups_cache";
  const CACHE_KEY_FORMS = "groupes_forms_cache";
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

  const fetchGroups = async () => {
    // Vérifier si c'est un rechargement de page (F5)
    const isPageReload =
      performance.navigation.type === 1 ||
      (window.performance &&
        window.performance.getEntriesByType("navigation")[0]?.type === "reload");

    // Si c'est un rechargement, ignorer le cache et forcer le rechargement
    if (isPageReload) {
      console.log("Rechargement de page détecté - Forcer le rechargement des groupes");
      localStorage.removeItem(CACHE_KEY_GROUPS);
    } else {
      // Vérifier le cache localStorage pour la navigation normale
      const cachedGroups = getFromCache(CACHE_KEY_GROUPS);
      if (cachedGroups) {
        console.log("Utilisation du cache localStorage pour les groupes");
        setGroups(cachedGroups);
        return;
      }
    }

    try {
      const data = await groupService.getAllGroups();
      // Le service retourne directement le tableau de groupes
      const groupsData = Array.isArray(data) ? data : [];
      console.log("Groupes récupérés:", groupsData);
      setGroups(groupsData);
      // Sauvegarder en cache localStorage seulement si ce n'est pas un rechargement
      if (!isPageReload) {
        saveToCache(CACHE_KEY_GROUPS, groupsData);
      }
    } catch (e) {
      console.error("Erreur fetchGroups:", e);
      setGroups([]);
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
      console.log("Rechargement de page détecté - Forcer le rechargement des formulaires");
      localStorage.removeItem(CACHE_KEY_FORMS);
    } else {
      // Vérifier le cache localStorage pour la navigation normale
      const cachedForms = getFromCache(CACHE_KEY_FORMS);
      if (cachedForms) {
        console.log("Utilisation du cache localStorage pour les formulaires");
        setForms(cachedForms);
        return;
      }
    }

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

      setForms(allForms);
      // Sauvegarder en cache localStorage seulement si ce n'est pas un rechargement
      if (!isPageReload) {
        saveToCache(CACHE_KEY_FORMS, allForms);
      }
    } catch (e) {
      console.error("Erreur fetchForms:", e);
      setForms([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchGroups(), fetchForms()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Ouvrir/fermer modals
  const openModal = (type, group = null) => {
    setModal((m) => ({ ...m, [type]: true }));
    setSelectedGroup(group);
    if (type === "edit" && group) setGroupName(group.name);
    if (type === "create") setGroupName("");
    if (type === "addForm") setSelectedForm("");
  };
  const closeModal = (type) => {
    setModal((m) => ({ ...m, [type]: false }));
    setSelectedGroup(null);
    setGroupName("");
    setSelectedForm("");
  };

  // Créer un groupe
  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    setActionLoading(true);
    try {
      await groupService.createGroup(groupName.trim());
      setGroups([]); // Forcer le rechargement pour mettre à jour la liste
      closeModal("create");
    } catch (e) {
      console.error("Erreur lors de la création du groupe:", e);
      // Ici vous pourriez ajouter une notification d'erreur
    }
    setActionLoading(false);
  };

  // Modifier un groupe
  const handleEditGroup = async () => {
    if (!groupName.trim() || !selectedGroup) return;
    setActionLoading(true);
    try {
      await groupService.updateGroup(selectedGroup.id, groupName.trim());
      setGroups([]); // Forcer le rechargement pour mettre à jour la liste
      closeModal("edit");
    } catch (e) {
      console.error("Erreur lors de la modification du groupe:", e);
      // Ici vous pourriez ajouter une notification d'erreur
    }
    setActionLoading(false);
  };

  // Supprimer un groupe
  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    setActionLoading(true);
    try {
      await groupService.deleteGroup(selectedGroup.id);
      setGroups([]); // Forcer le rechargement pour mettre à jour la liste
      closeModal("delete");
    } catch (e) {
      console.error("Erreur lors de la suppression du groupe:", e);
      // Ici vous pourriez ajouter une notification d'erreur
    }
    setActionLoading(false);
  };

  // Ajouter un formulaire à un groupe
  const handleAddFormToGroup = async () => {
    if (!selectedGroup || !selectedForm) return;
    setActionLoading(true);
    try {
      await groupService.addFormToGroup(selectedGroup.id, selectedForm);
      setGroups([]); // Forcer le rechargement pour mettre à jour la liste
      closeModal("addForm");
    } catch (e) {
      console.error("Erreur lors de l'ajout du formulaire au groupe:", e);
      // Ici vous pourriez ajouter une notification d'erreur
    }
    setActionLoading(false);
  };

  // Colonnes du tableau
  const columns = [
    { Header: "Nom du groupe", accessor: "name", width: "30%", align: "left" },
    { Header: "Identifiant", accessor: "identifier", align: "center" },
    { Header: "Créé le", accessor: "created_at", align: "center" },
    { Header: "Actions", accessor: "actions", align: "center" },
  ];

  // Lignes du tableau
  const rows = groups.map((g) => ({
    name: (
      <MDTypography variant="button" fontWeight="medium">
        {g.name}
      </MDTypography>
    ),
    identifier: (
      <MDTypography variant="caption" color="text">
        {g.identifier}
      </MDTypography>
    ),
    created_at: (
      <MDTypography variant="caption" color="text">
        {new Date(g.created_at).toLocaleDateString()}
      </MDTypography>
    ),
    actions: (
      <Box display="flex" justifyContent="center" gap={1}>
        <Tooltip title="Ajouter un formulaire">
          <IconButton color="primary" size="small" onClick={() => openModal("addForm", g)}>
            <PlaylistAddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Voir les formulaires du groupe">
          <IconButton color="info" size="small" onClick={() => handleViewGroupForms(g)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Modifier le groupe">
          <IconButton color="info" size="small" onClick={() => openModal("edit", g)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Supprimer le groupe">
          <IconButton color="error" size="small" onClick={() => openModal("delete", g)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  }));

  const handleViewGroupForms = async (group) => {
    try {
      const groupForms = await groupService.getGroupForms(group.id);
      setViewGroupForms({ open: true, group, forms: groupForms });
    } catch (error) {
      console.error("Erreur lors de la récupération des formulaires du groupe:", error);
      setViewGroupForms({ open: true, group, forms: [] });
    }
  };
  const handleCloseViewGroupForms = () =>
    setViewGroupForms({ open: false, group: null, forms: [] });

  const handleConfirmRemoveForm = (form, group) => setRemoveFormDialog({ open: true, form, group });
  const handleCloseRemoveFormDialog = () =>
    setRemoveFormDialog({ open: false, form: null, group: null });
  const handleRemoveFormFromGroup = async () => {
    if (!removeFormDialog.form || !removeFormDialog.group) return;
    setActionLoading(true);
    try {
      await groupService.removeFormFromGroup(removeFormDialog.group.id, removeFormDialog.form.id);
      setGroups([]); // Forcer le rechargement pour mettre à jour la liste
      handleCloseRemoveFormDialog();
      handleCloseViewGroupForms();
    } catch (e) {
      console.error("Erreur lors de la suppression du formulaire du groupe:", e);
      // Ici vous pourriez ajouter une notification d'erreur
    }
    setActionLoading(false);
  };

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
                  Groupes
                </MDTypography>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AddIcon />}
                  onClick={() => openModal("create")}
                  sx={{ boxShadow: "none" }}
                >
                  Créer un groupe
                </Button>
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
                        Chargement des groupes...
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

      {/* Modal Créer */}
      <Dialog
        open={modal.create}
        onClose={() => closeModal("create")}
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
          Créer un nouveau groupe
        </DialogTitle>
        <Typography variant="body2" sx={{ textAlign: "left", color: "#666", mb: 2, px: 4 }}>
          Donnez un nom à votre nouveau groupe pour organiser vos formulaires.
        </Typography>
        <DialogContent sx={{ pb: 4, pt: 0, mt: 3 }}>
          <TextField
            label="Nom du groupe"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            fullWidth
            sx={{
              background: "#fff",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#77af0a",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#77af0a",
                },
              },
            }}
            placeholder="Ex: Groupe Marketing, Équipe Ventes..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, gap: 1 }}>
          <Button
            onClick={() => closeModal("create")}
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
            disabled={actionLoading || !groupName.trim()}
            onClick={handleCreateGroup}
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : "Créer le groupe"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Modifier */}
      <Dialog
        open={modal.edit}
        onClose={() => closeModal("edit")}
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
          Modifier le groupe
        </DialogTitle>
        <Typography variant="body2" sx={{ textAlign: "left", color: "#666", mb: 2, px: 4 }}>
          Modifiez le nom de votre groupe pour mieux l&apos;organiser.
        </Typography>
        <DialogContent sx={{ pb: 4, pt: 0, mt: 3 }}>
          <TextField
            label="Nom du groupe"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            fullWidth
            sx={{
              background: "#fff",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#77af0a",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#77af0a",
                },
              },
            }}
            placeholder="Nouveau nom du groupe..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, gap: 1 }}>
          <Button
            onClick={() => closeModal("edit")}
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
            disabled={actionLoading || !groupName.trim()}
            onClick={handleEditGroup}
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Supprimer */}
      <Dialog
        open={modal.delete}
        onClose={() => closeModal("delete")}
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
            color: "#d32f2f",
            px: 4,
          }}
        >
          ⚠️ Supprimer le groupe
        </DialogTitle>
        <Typography variant="body2" sx={{ textAlign: "left", color: "#666", mb: 2, px: 4 }}>
          Cette action est irréversible. Tous les formulaires associés à ce groupe seront également
          affectés.
        </Typography>
        <DialogContent sx={{ pb: 4, pt: 0, mt: 3 }}>
          <Box
            sx={{
              p: 3,
              bgcolor: "rgba(211, 47, 47, 0.05)",
              borderRadius: 2,
              border: "1px solid rgba(211, 47, 47, 0.2)",
            }}
          >
            <Typography variant="h6" color="error" fontWeight="bold" mb={1}>
              Groupe à supprimer : {selectedGroup?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Identifiant : {selectedGroup?.identifier}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, gap: 1 }}>
          <Button
            onClick={() => closeModal("delete")}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 4,
              borderColor: "#666",
              color: "#666",
              "&:hover": {
                borderColor: "#333",
                backgroundColor: "rgba(0, 0, 0, 0.04)",
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
              background: "#d32f2f",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#b71c1c",
              },
            }}
            disabled={actionLoading}
            onClick={handleDeleteGroup}
          >
            {actionLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Supprimer définitivement"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Ajouter Formulaire */}
      <Dialog
        open={modal.addForm}
        onClose={() => closeModal("addForm")}
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
          📋 Ajouter un formulaire
        </DialogTitle>
        <Typography variant="body2" sx={{ textAlign: "left", color: "#666", mb: 2, px: 4 }}>
          Sélectionnez un formulaire à ajouter au groupe &quot;{selectedGroup?.name}&quot;.
        </Typography>
        <DialogContent sx={{ pb: 4, pt: 0, mt: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="select-form-label" sx={{ color: "#666" }}>
              Choisir un formulaire
            </InputLabel>
            <Select
              labelId="select-form-label"
              value={selectedForm}
              label="Choisir un formulaire"
              onChange={(e) => setSelectedForm(e.target.value)}
              sx={{
                background: "#fff",
                borderRadius: 2,
                minHeight: 56,
                fontSize: 16,
                fontWeight: 500,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "2px solid transparent",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 6px 25px rgba(0,0,0,0.12)",
                  transform: "translateY(-1px)",
                },
                "&.Mui-focused": {
                  borderColor: "#77af0a",
                  boxShadow: "0 8px 30px rgba(119, 175, 10, 0.15)",
                },
                "& .MuiSelect-icon": {
                  color: "#77af0a",
                  fontSize: 24,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "& .MuiSelect-select": {
                  color: selectedForm ? "#333" : "#999",
                  fontWeight: selectedForm ? 600 : 400,
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: 3,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                    border: "1px solid #e0e0e0",
                    maxHeight: 400,
                  },
                },
              }}
            >
              {forms.map((form, index) => (
                <MenuItem
                  key={form.id}
                  value={form.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 2,
                    px: 3,
                    fontSize: 15,
                    fontWeight: 500,
                    borderBottom: "1px solid #f5f5f5",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: "linear-gradient(135deg, #f8f9fa 0%, #e8f5e8 100%)",
                      transform: "translateX(4px)",
                    },
                    "&.Mui-selected": {
                      background: "linear-gradient(135deg, #77af0a 0%, #8bc34a 100%)",
                      color: "#fff",
                      fontWeight: 600,
                      "&:hover": {
                        background: "linear-gradient(135deg, #6a9a09 0%, #7cb342 100%)",
                      },
                    },
                    "&:last-child": {
                      borderBottom: "none",
                    },
                  }}
                >
                  <Box
                    sx={{
                      fontSize: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "rgba(119, 175, 10, 0.1)",
                      color: "#77af0a",
                    }}
                  >
                    📄
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <MDTypography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        fontSize: 15,
                        lineHeight: 1.3,
                      }}
                    >
                      {form.title || `Formulaire ${index + 1}`}
                    </MDTypography>
                    <MDTypography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: 12,
                        display: "block",
                        mt: 0.5,
                      }}
                    >
                      {form.parameters?.length || 0} questions
                    </MDTypography>
                  </Box>
                  {selectedForm === form.id && (
                    <Icon sx={{ fontSize: 20, color: "#fff" }}>check_circle</Icon>
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, gap: 1 }}>
          <Button
            onClick={() => closeModal("addForm")}
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
            disabled={actionLoading || !selectedForm}
            onClick={handleAddFormToGroup}
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : "Ajouter au groupe"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Voir les formulaires du groupe */}
      <Dialog
        open={viewGroupForms.open}
        onClose={handleCloseViewGroupForms}
        maxWidth="md"
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
          📋 Formulaires du groupe
        </DialogTitle>
        <Typography variant="body2" sx={{ textAlign: "left", color: "#666", mb: 2, px: 4 }}>
          Liste des formulaires associés au groupe &quot;{viewGroupForms.group?.name}&quot;.
        </Typography>
        <DialogContent sx={{ pb: 4, pt: 0, mt: 3 }}>
          {viewGroupForms.group ? (
            (() => {
              const groupFormList = viewGroupForms.forms || [];
              return groupFormList.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {groupFormList.map((f, index) => (
                    <Paper
                      key={f.id}
                      sx={{
                        p: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderRadius: 3,
                        border: "2px solid #e0e7ef",
                        background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          borderColor: "#77af0a",
                          boxShadow: "0 8px 25px rgba(119, 175, 10, 0.15)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #77af0a 0%, #8bc34a 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: 20,
                            fontWeight: "bold",
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="bold" color="#333">
                            {f.title || f.name || f.label || f.id || "Sans nom"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {f.parameters?.length || 0} questions • Créé le{" "}
                            {new Date(f.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Tooltip title="Retirer du groupe">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleConfirmRemoveForm(f, viewGroupForms.group)}
                          sx={{
                            background: "rgba(211, 47, 47, 0.1)",
                            "&:hover": {
                              background: "rgba(211, 47, 47, 0.2)",
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 6,
                    color: "text.secondary",
                  }}
                >
                  <Icon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }}>folder_open</Icon>
                  <Typography variant="h6" color="text.secondary" mb={1}>
                    Aucun formulaire dans ce groupe
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajoutez des formulaires pour commencer à organiser votre contenu.
                  </Typography>
                </Box>
              );
            })()
          ) : (
            <Typography>Aucun groupe sélectionné.</Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4 }}>
          <Button
            onClick={handleCloseViewGroupForms}
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
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmation suppression formulaire du groupe */}
      <Dialog
        open={removeFormDialog.open}
        onClose={handleCloseRemoveFormDialog}
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
            color: "#d32f2f",
            px: 4,
          }}
        >
          🗑️ Retirer le formulaire
        </DialogTitle>
        <Typography variant="body2" sx={{ textAlign: "left", color: "#666", mb: 2, px: 4 }}>
          Confirmez que vous souhaitez retirer ce formulaire du groupe.
        </Typography>
        <DialogContent sx={{ pb: 4, pt: 0, mt: 3 }}>
          <Box
            sx={{
              p: 3,
              bgcolor: "rgba(211, 47, 47, 0.05)",
              borderRadius: 2,
              border: "1px solid rgba(211, 47, 47, 0.2)",
            }}
          >
            <Typography variant="h6" color="error" fontWeight="bold" mb={1}>
              Formulaire à retirer :
            </Typography>
            <Typography variant="body1" fontWeight="medium" mb={1}>
              {removeFormDialog.form &&
                (removeFormDialog.form.title ||
                  removeFormDialog.form.name ||
                  removeFormDialog.form.label ||
                  removeFormDialog.form.id ||
                  "Sans nom")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Du groupe : {removeFormDialog.group?.name}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, gap: 1 }}>
          <Button
            onClick={handleCloseRemoveFormDialog}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 4,
              borderColor: "#666",
              color: "#666",
              "&:hover": {
                borderColor: "#333",
                backgroundColor: "rgba(0, 0, 0, 0.04)",
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
              background: "#d32f2f",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#b71c1c",
              },
            }}
            disabled={actionLoading}
            onClick={handleRemoveFormFromGroup}
          >
            {actionLoading ? <CircularProgress size={20} color="inherit" /> : "Retirer du groupe"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Groupes;
