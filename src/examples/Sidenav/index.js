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

// react-router-dom components
import { useLocation, NavLink } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";

// Custom styles for the Sidenav
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DescriptionIcon from "@mui/icons-material/Description";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;
  const location = useLocation();
  const collapseName = location.pathname.replace("/", "");

  let textColor = "white";

  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  useEffect(() => {
    // A function that sets the mini state of the sidenav.
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
      setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
    }

    /** 
     The event listener that's calling the handleMiniSidenav function when resizing the window.
    */
    window.addEventListener("resize", handleMiniSidenav);

    // Call the handleMiniSidenav function to set the state with the initial value.
    handleMiniSidenav();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location]);

  // Modals pour création de formulaire
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [swalModal, setSwalModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "success", // success, error, warning, info
    showConfirmButton: true,
    confirmText: "OK",
    onConfirm: null,
  });
  const handleOpenCreateModal = () => setCreateModalOpen(true);
  const handleCloseCreateModal = () => setCreateModalOpen(false);
  const handleOpenExcelModal = () => {
    setCreateModalOpen(false);
    setExcelModalOpen(true);
  };
  const handleCloseExcelModal = () => {
    setExcelModalOpen(false);
    setExcelFile(null);
  };
  const handleExcelFileChange = (e) => {
    setExcelFile(e.target.files[0] || null);
  };
  const handleCreateFromScratch = () => {
    setCreateModalOpen(false);
    window.open(`${window.location.origin}/formulaire`, "_blank");
  };
  const handleSendExcel = async () => {
    if (!excelFile) return;
    setExcelLoading(true);
    try {
      const formData = new FormData();
      formData.append("content_type", "excel");
      formData.append("excel_file", excelFile);
      const response = await fetch(
        "https://api-gti-collect.green-tech-innovation.com/collecte/forms/create",
        {
          method: "POST",
          headers: { Authorization: `Token ${localStorage.getItem("token")}` },
          body: formData,
        }
      );
      const res = await response.json();
      if (res && res.data && res.data.id) {
        window.open(`${window.location.origin}/formulaire/${res.data.id}`, "_blank");
        setExcelModalOpen(false);
        setExcelFile(null);
        setSwalModal({
          open: true,
          title: "Succès !",
          message: "Le formulaire a été créé avec succès et s'ouvre dans un nouvel onglet.",
          type: "success",
          confirmText: "Parfait",
        });
      } else {
        setSwalModal({
          open: true,
          title: "Erreur",
          message: res.message || "Une erreur est survenue lors de la création du formulaire.",
          type: "error",
          confirmText: "Compris",
        });
      }
    } catch (e) {
      setSwalModal({
        open: true,
        title: "Erreur",
        message: "Une erreur est survenue lors de la création du formulaire.",
        type: "error",
        confirmText: "Compris",
      });
    }
    setExcelLoading(false);
  };

  // Render all the routes from the routes.js (All the visible items on the Sidenav)
  const renderRoutes = routes.map(({ type, name, icon, title, noCollapse, key, href, route }) => {
    let returnValue;

    if (type === "collapse") {
      returnValue = href ? (
        <Link
          href={href}
          key={key}
          target="_blank"
          rel="noreferrer"
          sx={{ textDecoration: "none" }}
        >
          <SidenavCollapse
            name={name}
            icon={icon}
            active={key === collapseName}
            noCollapse={noCollapse}
          />
        </Link>
      ) : (
        <NavLink key={key} to={route}>
          <SidenavCollapse name={name} icon={icon} active={key === collapseName} />
        </NavLink>
      );
    } else if (type === "title") {
      returnValue = (
        <MDTypography
          key={key}
          color={textColor}
          display="block"
          variant="caption"
          fontWeight="bold"
          textTransform="uppercase"
          pl={3}
          mt={2}
          mb={1}
          ml={1}
        >
          {title}
        </MDTypography>
      );
    } else if (type === "divider") {
      returnValue = (
        <Divider
          key={key}
          light={
            (!darkMode && !whiteSidenav && !transparentSidenav) ||
            (darkMode && !transparentSidenav && whiteSidenav)
          }
        />
      );
    }

    return returnValue;
  });

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      <MDBox pt={3} pb={1} px={4} textAlign="center">
        <MDBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <MDTypography variant="h6" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </MDTypography>
        </MDBox>
        <MDBox component={NavLink} to="/" display="flex" alignItems="center">
          {brand && <MDBox component="img" src={brand} alt="Brand" width="2rem" />}
          <MDBox
            width={!brandName && "100%"}
            sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
          >
            <MDTypography component="h6" variant="button" fontWeight="medium" color={textColor}>
              {brandName}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
      <MDBox p={2} pb={0}>
        <Box display="flex" justifyContent="center">
          <MDButton
            variant="gradient"
            color="secondary"
            onClick={handleOpenCreateModal}
            sx={{ fontWeight: "bold", fontSize: 13, py: 1, minWidth: 0, width: "90%" }}
          >
            + Nouveau Formulaire
          </MDButton>
        </Box>
        {/* Modal de choix de création */}
        <Dialog
          open={createModalOpen}
          onClose={handleCloseCreateModal}
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
            Créer un formulaire
          </DialogTitle>
          <Typography variant="body2" sx={{ textAlign: "left", color: "#666", mb: 2, px: 4 }}>
            Choisissez la méthode de création&nbsp;: importez un fichier Excel ou commencez à partir
            de zéro.
          </Typography>
          <DialogContent sx={{ pb: 4, pt: 0, mt: 3 }}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="stretch"
              gap={3}
              flexWrap={{ xs: "wrap", sm: "nowrap" }}
            >
              <Button
                variant="outlined"
                color="primary"
                onClick={handleOpenExcelModal}
                sx={{
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: 17,
                  px: 4,
                  py: 4,
                  width: 280,
                  minHeight: 140,
                  boxShadow: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  background: "#fff",
                  transition: "all 0.18s",
                  border: "2px solid #e0e7ef",
                  "&:hover": {
                    background: "#eaf6ff",
                    boxShadow: 6,
                    borderColor: "#1976d2",
                    transform: "translateY(-2px) scale(1.03)",
                  },
                }}
              >
                <InsertDriveFileIcon sx={{ fontSize: 54, color: "#1976d2", mb: 1 }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#1976d2", mb: 0.5, fontSize: 18 }}
                >
                  Excel
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#555", textAlign: "center", fontSize: 14 }}
                >
                  Importez un fichier Excel pour générer automatiquement le formulaire
                </Typography>
              </Button>
              <Button
                variant="outlined"
                color="success"
                onClick={handleCreateFromScratch}
                sx={{
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: 17,
                  px: 4,
                  py: 4,
                  width: 280,
                  minHeight: 140,
                  boxShadow: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  background: "#fff",
                  transition: "all 0.18s",
                  border: "2px solid #e0e7ef",
                  "&:hover": {
                    background: "#e7fbe7",
                    boxShadow: 6,
                    borderColor: "#43a047",
                    transform: "translateY(-2px) scale(1.03)",
                  },
                }}
              >
                <DescriptionIcon sx={{ fontSize: 54, color: "#43a047", mb: 1 }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#43a047", mb: 0.5, fontSize: 18 }}
                >
                  À partir de zéro
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#555", textAlign: "center", fontSize: 14 }}
                >
                  Démarrez un formulaire vierge et personnalisez-le
                </Typography>
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
        {/* Modal upload Excel */}
        <Dialog
          open={excelModalOpen}
          onClose={handleCloseExcelModal}
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
            Importer un fichier Excel
          </DialogTitle>
          <Typography variant="body2" sx={{ textAlign: "left", color: "#666", mb: 2, px: 4 }}>
            Sélectionnez votre fichier Excel (.xlsx ou .xls) pour créer automatiquement le
            formulaire.
          </Typography>
          <DialogContent sx={{ pb: 4, pt: 0, mt: 3 }}>
            <Box display="flex" justifyContent="center" alignItems="center">
              <Button
                variant="outlined"
                component="label"
                sx={{
                  borderRadius: 3,
                  fontWeight: 600,
                  fontSize: 16,
                  px: 6,
                  py: 3,
                  width: 340,
                  minHeight: 70,
                  boxShadow: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  background: "#fff",
                  transition: "all 0.18s",
                  border: "2px solid #e0e7ef",
                  "&:hover": {
                    background: "#f5f5f5",
                    boxShadow: 6,
                    borderColor: "#666",
                    transform: "translateY(-2px) scale(1.02)",
                  },
                }}
              >
                <InsertDriveFileIcon sx={{ fontSize: 48, color: "#666", mb: 1 }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#333", mb: 0.5, fontSize: 16 }}
                >
                  {excelFile ? excelFile.name : "Choisir un fichier Excel"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#666", textAlign: "center", fontSize: 13 }}
                >
                  {excelFile ? "Fichier sélectionné" : "Formats acceptés : .xlsx, .xls"}
                </Typography>
                <input type="file" accept=".xlsx,.xls" hidden onChange={handleExcelFileChange} />
              </Button>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 4, pb: 4, gap: 1 }}>
            <Button
              onClick={handleCloseExcelModal}
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
              onClick={handleSendExcel}
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
              disabled={!excelFile || excelLoading}
            >
              {excelLoading ? <CircularProgress size={20} color="inherit" /> : "Envoyer"}
            </Button>
          </DialogActions>
        </Dialog>
      </MDBox>
      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />
      <List>{renderRoutes}</List>
      {/* Modal SweetAlert style */}
      <Dialog
        open={swalModal.open}
        onClose={() => setSwalModal({ ...swalModal, open: false })}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            p: 0,
            overflow: "visible",
            background: "#fff",
          },
        }}
        TransitionProps={{
          onEnter: () => {
            // Auto-fermer après 10 secondes
            setTimeout(() => {
              setSwalModal({ ...swalModal, open: false });
            }, 10000);
          },
        }}
      >
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* Icône */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
              ...(swalModal.type === "success" && {
                background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                boxShadow: "0 8px 25px rgba(76, 175, 80, 0.3)",
              }),
              ...(swalModal.type === "error" && {
                background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
                boxShadow: "0 8px 25px rgba(244, 67, 54, 0.3)",
              }),
              ...(swalModal.type === "warning" && {
                background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                boxShadow: "0 8px 25px rgba(255, 152, 0, 0.3)",
              }),
              ...(swalModal.type === "info" && {
                background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                boxShadow: "0 8px 25px rgba(33, 150, 243, 0.3)",
              }),
            }}
          >
            {swalModal.type === "success" && (
              <CheckCircleIcon sx={{ fontSize: 40, color: "#fff" }} />
            )}
            {swalModal.type === "error" && <ErrorIcon sx={{ fontSize: 40, color: "#fff" }} />}
            {swalModal.type === "warning" && <WarningIcon sx={{ fontSize: 40, color: "#fff" }} />}
            {swalModal.type === "info" && <InfoIcon sx={{ fontSize: 40, color: "#fff" }} />}
          </Box>

          {/* Titre */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: "#2c3e50",
              fontSize: 24,
            }}
          >
            {swalModal.title}
          </Typography>

          {/* Message */}
          <Typography
            variant="body1"
            sx={{
              color: "#7f8c8d",
              mb: 4,
              fontSize: 16,
              lineHeight: 1.5,
            }}
          >
            {swalModal.message}
          </Typography>

          {/* Bouton de confirmation */}
          {swalModal.showConfirmButton && (
            <Button
              variant="contained"
              onClick={() => {
                setSwalModal({ ...swalModal, open: false });
                if (swalModal.onConfirm) swalModal.onConfirm();
              }}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: 16,
                textTransform: "none",
                ...(swalModal.type === "success" && {
                  background: "linear-gradient(135deg, #4caf50 0%, #45a049 100%)",
                  "&:hover": { background: "linear-gradient(135deg, #45a049 0%, #388e3c 100%)" },
                }),
                ...(swalModal.type === "error" && {
                  background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
                  "&:hover": { background: "linear-gradient(135deg, #d32f2f 0%, #c62828 100%)" },
                }),
                ...(swalModal.type === "warning" && {
                  background: "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)",
                  "&:hover": { background: "linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)" },
                }),
                ...(swalModal.type === "info" && {
                  background: "linear-gradient(135deg, #2196f3 0%, #1976d2 100%)",
                  "&:hover": { background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)" },
                }),
              }}
            >
              {swalModal.confirmText}
            </Button>
          )}
        </Box>
      </Dialog>
    </SidenavRoot>
  );
}

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

// Typechecking props for the Sidenav
Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
