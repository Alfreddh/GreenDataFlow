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
  TextField,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Tooltip,
  Box,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import VisibilityIcon from "@mui/icons-material/Visibility";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

import { groupService, formService } from "../../services/api";

function Groupes() {
  const [groups, setGroups] = useState([]);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [modal, setModal] = useState({
    create: false,
    edit: false,
    delete: false,
    addForm: false,
  });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [formToAdd, setFormToAdd] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewGroupForms, setViewGroupForms] = useState({ open: false, group: null });
  const [removeFormDialog, setRemoveFormDialog] = useState({
    open: false,
    form: null,
    group: null,
  });

  // Charger groupes et formulaires
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await groupService.getAllGroups();
      setGroups(data || []);
      setIsLoaded(true);
    } catch (e) {
      setGroups([]);
    }
    setLoading(false);
  };
  const fetchForms = async () => {
    try {
      const data = await formService.getAllForms();
      setForms(data?.results?.data || []);
    } catch (e) {
      setForms([]);
    }
  };
  useEffect(() => {
    if (!isLoaded) {
      fetchGroups();
      fetchForms();
    }
  }, [isLoaded]);

  // Ouvrir/fermer modals
  const openModal = (type, group = null) => {
    setModal((m) => ({ ...m, [type]: true }));
    setSelectedGroup(group);
    if (type === "edit" && group) setGroupName(group.name);
    if (type === "create") setGroupName("");
    if (type === "addForm") setFormToAdd("");
  };
  const closeModal = (type) => {
    setModal((m) => ({ ...m, [type]: false }));
    setSelectedGroup(null);
    setGroupName("");
    setFormToAdd("");
  };

  // Créer un groupe
  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;
    setActionLoading(true);
    try {
      await groupService.createGroup(groupName.trim());
      setIsLoaded(false);
      closeModal("create");
    } catch (e) {}
    setActionLoading(false);
  };

  // Modifier un groupe
  const handleEditGroup = async () => {
    if (!groupName.trim() || !selectedGroup) return;
    setActionLoading(true);
    try {
      await groupService.updateGroup(selectedGroup.id, groupName.trim());
      setIsLoaded(false);
      closeModal("edit");
    } catch (e) {}
    setActionLoading(false);
  };

  // Supprimer un groupe
  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    setDeleteLoading(true);
    try {
      await groupService.deleteGroup(selectedGroup.id);
      setIsLoaded(false);
      closeModal("delete");
    } catch (e) {}
    setDeleteLoading(false);
  };

  // Ajouter un formulaire à un groupe
  const handleAddFormToGroup = async () => {
    if (!selectedGroup || !formToAdd) return;
    setActionLoading(true);
    try {
      await groupService.addFormToGroup(selectedGroup.id, formToAdd);
      setIsLoaded(false);
      closeModal("addForm");
    } catch (e) {}
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

  const handleViewGroupForms = (group) => setViewGroupForms({ open: true, group });
  const handleCloseViewGroupForms = () => setViewGroupForms({ open: false, group: null });

  const handleConfirmRemoveForm = (form, group) => setRemoveFormDialog({ open: true, form, group });
  const handleCloseRemoveFormDialog = () =>
    setRemoveFormDialog({ open: false, form: null, group: null });
  const handleRemoveFormFromGroup = async () => {
    if (!removeFormDialog.form || !removeFormDialog.group) return;
    setActionLoading(true);
    try {
      await groupService.removeFormFromGroup(removeFormDialog.group.id, removeFormDialog.form.id);
      setIsLoaded(false);
      handleCloseRemoveFormDialog();
      handleCloseViewGroupForms();
    } catch (e) {}
    setActionLoading(false);
  };

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

      {/* Modal Créer */}
      <Dialog open={modal.create} onClose={() => closeModal("create")} maxWidth="xs" fullWidth>
        <DialogTitle>Créer un groupe</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom du groupe"
            type="text"
            fullWidth
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeModal("create")} disabled={actionLoading}>
            Annuler
          </Button>
          <Button
            onClick={handleCreateGroup}
            variant="contained"
            color="success"
            disabled={actionLoading || !groupName.trim()}
          >
            {actionLoading ? <CircularProgress size={20} /> : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Modifier */}
      <Dialog open={modal.edit} onClose={() => closeModal("edit")} maxWidth="xs" fullWidth>
        <DialogTitle>Modifier le groupe</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom du groupe"
            type="text"
            fullWidth
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeModal("edit")} disabled={actionLoading}>
            Annuler
          </Button>
          <Button
            onClick={handleEditGroup}
            variant="contained"
            color="info"
            disabled={actionLoading || !groupName.trim()}
          >
            {actionLoading ? <CircularProgress size={20} /> : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Supprimer */}
      <Dialog open={modal.delete} onClose={() => closeModal("delete")} maxWidth="xs" fullWidth>
        <DialogTitle>Supprimer le groupe</DialogTitle>
        <DialogContent>
          <Typography>Voulez-vous vraiment supprimer ce groupe ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeModal("delete")} disabled={deleteLoading}>
            Annuler
          </Button>
          <Button
            onClick={handleDeleteGroup}
            variant="contained"
            color="error"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={20} /> : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Ajouter Formulaire */}
      <Dialog open={modal.addForm} onClose={() => closeModal("addForm")} maxWidth="xs" fullWidth>
        <DialogTitle>Ajouter un formulaire au groupe</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel id="select-form-label">Formulaire</InputLabel>
            <Select
              labelId="select-form-label"
              value={formToAdd}
              label="Formulaire"
              onChange={(e) => setFormToAdd(e.target.value)}
              sx={{ minHeight: 48, fontSize: 18 }}
            >
              {forms.map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {f.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeModal("addForm")} disabled={actionLoading}>
            Annuler
          </Button>
          <Button
            onClick={handleAddFormToGroup}
            variant="contained"
            color="primary"
            disabled={actionLoading || !formToAdd}
          >
            {actionLoading ? <CircularProgress size={20} /> : "Ajouter"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Voir les formulaires du groupe */}
      <Dialog
        open={viewGroupForms.open}
        onClose={handleCloseViewGroupForms}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Formulaires du groupe</DialogTitle>
        <DialogContent>
          {viewGroupForms.group ? (
            (() => {
              const groupFormList = forms.filter(
                (f) => f.group && f.group.id === viewGroupForms.group.id
              );
              return groupFormList.length > 0 ? (
                <ul style={{ paddingLeft: 0, listStyle: "none" }}>
                  {groupFormList.map((f) => (
                    <li
                      key={f.id}
                      style={{ display: "flex", alignItems: "center", marginBottom: 8 }}
                    >
                      <span style={{ flex: 1 }}>
                        {f.title || f.name || f.label || f.id || "Sans nom"}
                      </span>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleConfirmRemoveForm(f, viewGroupForms.group)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography>Aucun formulaire dans ce groupe.</Typography>
              );
            })()
          ) : (
            <Typography>Aucun formulaire dans ce groupe.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewGroupForms}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmation suppression formulaire du groupe */}
      <Dialog
        open={removeFormDialog.open}
        onClose={handleCloseRemoveFormDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Retirer le formulaire</DialogTitle>
        <DialogContent>
          <Typography>Voulez-vous vraiment retirer ce formulaire du groupe ?</Typography>
          <Typography fontWeight="bold" mt={2}>
            {removeFormDialog.form &&
              (removeFormDialog.form.title ||
                removeFormDialog.form.name ||
                removeFormDialog.form.label ||
                removeFormDialog.form.id ||
                "Sans nom")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemoveFormDialog} disabled={actionLoading}>
            Annuler
          </Button>
          <Button
            onClick={handleRemoveFormFromGroup}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={20} /> : "Retirer"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Groupes;
