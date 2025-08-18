import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formService } from "../../services/api";
import { Box, Button, Card, CircularProgress, Grid, Typography } from "@mui/material";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

export default function FormResponses() {
  const { formId } = useParams();
  const [responses, setResponses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [selectedResponseId, setSelectedResponseId] = useState(null);
  const [selectedResponseDatas, setSelectedResponseDatas] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Récupérer la structure du formulaire (questions)
  const fetchQuestions = async () => {
    try {
      const form = await formService.getFormById(formId);
      setQuestions(form?.data?.parameters || []);
    } catch (e) {
      setQuestions([]);
    }
  };

  // Récupérer les réponses détaillées (vraies datas)
  const fetchResponses = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Récupérer la liste des réponses (ids)
      const data = await formService.getFormResponsesV2(formId);
      const baseResponses = data.results?.data || [];
      // 2. Charger les datas détaillées pour chaque réponse
      const detailedResponses = await Promise.all(
        baseResponses.map(async (resp) => {
          try {
            const detail = await formService.getFormResponseDatas(resp.id);
            return detail.data;
          } catch (e) {
            return null;
          }
        })
      );
      // 3. Filtrer les réponses nulles (erreur de chargement)
      setResponses(detailedResponses.filter(Boolean));
    } catch (e) {
      setError("Erreur lors du chargement des réponses.");
      setResponses([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
    fetchResponses();
    // eslint-disable-next-line
  }, [formId]);

  const handleOpenDetail = async (responseId) => {
    setSelectedResponseId(responseId);
    setDetailLoading(true);
    try {
      const data = await formService.getFormResponseDatas(responseId);
      setSelectedResponseDatas(data.data);
    } catch (e) {
      setSelectedResponseDatas(null);
    }
    setDetailLoading(false);
  };
  const handleCloseDetail = () => {
    setSelectedResponseId(null);
    setSelectedResponseDatas(null);
  };

  // Colonnes dynamiques
  const columns = [
    { Header: "ID", accessor: "id", align: "center" },
    { Header: "Créé par", accessor: "created_by", align: "center" },
    { Header: "Email", accessor: "created_by_email", align: "center" },
    { Header: "Date de création", accessor: "created_at", align: "center" },
    ...questions.map((q) => {
      const key = q.libelle || q.label;
      return {
        Header: key || `Q${q.order}`,
        accessor: key || `Q${q.order}`,
        align: "center",
      };
    }),
  ];

  // Construction des lignes
  const rows = responses.map((resp) => {
    // resp est maintenant la structure détaillée (data.data)
    const paramMap = {};
    const paramObs = {};
    const paramModalities = {};
    if (Array.isArray(resp.parameter_responses)) {
      resp.parameter_responses.forEach((pr) => {
        paramMap[pr.parameter_libelle] = pr.value;
        paramObs[pr.parameter_libelle] = pr.observation;
        paramModalities[pr.parameter_libelle] = pr.modalities;
      });
    }
    const row = {
      id: resp.response_form.id,
      created_by: resp.response_form.created_by,
      created_by_email: resp.response_form.created_by_email,
      created_at: resp.response_form.created_at
        ? new Date(resp.response_form.created_at).toLocaleDateString()
        : "",
    };
    questions.forEach((q) => {
      const key = q.libelle || q.label;
      let displayValue = paramMap[key] || "";
      let obs = paramObs[key] || null;
      let modalities = paramModalities[key] || [];
      let lat = null,
        lon = null;
      // Cas spécial : type fichier
      if (
        q.type === "fichier" &&
        displayValue &&
        typeof displayValue === "string" &&
        (displayValue.startsWith("http://") || displayValue.startsWith("https://"))
      ) {
        displayValue = (
          <Button
            variant="contained"
            size="small"
            sx={{
              backgroundColor: "#77af0a",
              color: "white",
              fontWeight: "bold",
              textTransform: "none",
            }}
            onClick={() => window.open(paramMap[key], "_blank")}
          >
            Voir le fichier
          </Button>
        );
      } else if (
        (q.type === "position" || q.type === "gps" || q.type === "localisation") &&
        displayValue
      ) {
        if (typeof displayValue === "string" && displayValue.includes(",")) {
          [lat, lon] = displayValue.split(",").map((v) => v.trim());
        } else if (
          (typeof displayValue === "string" && displayValue.trim().startsWith("{")) ||
          typeof displayValue === "object"
        ) {
          let posObj = displayValue;
          if (typeof displayValue === "string") {
            try {
              posObj = JSON.parse(displayValue);
            } catch (e) {
              posObj = null;
            }
          }
          if (posObj && posObj.latitude && posObj.longitude) {
            lat = posObj.latitude;
            lon = posObj.longitude;
          }
        }
        if (lat && lon) {
          displayValue = (
            <a
              href={`https://www.google.com/maps?q=${lat},${lon}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#77af0a", textDecoration: "underline", fontWeight: "bold" }}
            >
              {lat}, {lon}
            </a>
          );
        }
      }
      row[key || `Q${q.order}`] = (
        <div>
          <span>{displayValue}</span>
          {obs && <div style={{ color: "#888", fontSize: 12 }}>[Obs: {obs}]</div>}
          {modalities && modalities.length > 0 && (
            <div style={{ color: "#888", fontSize: 12 }}>
              Modalités: {modalities.map((m) => m.libelle).join(", ")}
            </div>
          )}
        </div>
      );
    });
    return row;
  });

  // Exporter les réponses
  const handleExport = async () => {
    setExportLoading(true);
    try {
      // Générer le nom de fichier avec date et heure
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ""); // HHMMSS
      const filename = `exportresponse${dateStr}${timeStr}.csv`;

      // Préparer les données pour l'export
      const exportData = [];

      // En-têtes
      const headers = [
        "ID",
        "Créé par",
        "Email",
        "Date de création",
        ...questions.map((q) => q.libelle || q.label || `Q${q.order}`),
      ];
      exportData.push(headers);

      // Données des réponses
      responses.forEach((resp) => {
        const paramMap = {};
        const paramObs = {};
        const paramModalities = {};

        if (Array.isArray(resp.parameter_responses)) {
          resp.parameter_responses.forEach((pr) => {
            paramMap[pr.parameter_libelle] = pr.value;
            paramObs[pr.parameter_libelle] = pr.observation;
            paramModalities[pr.parameter_libelle] = pr.modalities;
          });
        }

        const row = [
          resp.response_form.id,
          resp.response_form.created_by || "",
          resp.response_form.created_by_email || "",
          resp.response_form.created_at
            ? new Date(resp.response_form.created_at).toLocaleDateString()
            : "",
        ];

        // Ajouter les réponses aux questions
        questions.forEach((q) => {
          const key = q.libelle || q.label;
          let value = paramMap[key] || "";
          let obs = paramObs[key] || null;
          let modalities = paramModalities[key] || [];

          // Traitement spécial pour les types de questions
          if (
            q.type === "fichier" &&
            value &&
            typeof value === "string" &&
            (value.startsWith("http://") || value.startsWith("https://"))
          ) {
            value = value; // Garder l'URL
          } else if (
            (q.type === "position" || q.type === "gps" || q.type === "localisation") &&
            value
          ) {
            if (typeof value === "string" && value.includes(",")) {
              value = value; // Garder les coordonnées
            } else if (
              (typeof value === "string" && value.trim().startsWith("{")) ||
              typeof value === "object"
            ) {
              let posObj = value;
              if (typeof value === "string") {
                try {
                  posObj = JSON.parse(value);
                } catch (e) {
                  posObj = null;
                }
              }
              if (posObj && posObj.latitude && posObj.longitude) {
                value = `${posObj.latitude}, ${posObj.longitude}`;
              }
            }
          }

          // Ajouter l'observation si elle existe
          if (obs) {
            value += ` [Obs: ${obs}]`;
          }

          // Ajouter les modalités si elles existent
          if (modalities && modalities.length > 0) {
            value += ` [Modalités: ${modalities.map((m) => m.libelle).join(", ")}]`;
          }

          row.push(value);
        });

        exportData.push(row);
      });

      // Convertir en CSV avec BOM pour Excel
      const BOM = "\uFEFF"; // Byte Order Mark pour UTF-8
      const csvContent =
        BOM +
        exportData
          .map(
            (row) =>
              row
                .map((cell) => {
                  // Nettoyer et échapper les cellules
                  const cellStr = String(cell || "").trim();

                  // Remplacer les retours à la ligne et tabulations
                  const cleanCell = cellStr
                    .replace(/\r\n/g, " ")
                    .replace(/\n/g, " ")
                    .replace(/\r/g, " ")
                    .replace(/\t/g, " ");

                  // Échapper les guillemets et entourer de guillemets si nécessaire
                  if (
                    cleanCell.includes(",") ||
                    cleanCell.includes('"') ||
                    cleanCell.includes(";")
                  ) {
                    return `"${cleanCell.replace(/"/g, '""')}"`;
                  }
                  return cleanCell;
                })
                .join(";") // Utiliser le point-virgule comme séparateur pour Excel
          )
          .join("\r\n"); // Utiliser \r\n pour Windows

      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
        endings: "native",
      });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      alert("Erreur lors de l'export.");
    }
    setExportLoading(false);
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
                  Réponses du formulaire
                </MDTypography>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: "#77af0a", color: "white", fontWeight: "bold" }}
                  onClick={handleExport}
                  disabled={exportLoading}
                >
                  {exportLoading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    "Exporter la base"
                  )}
                </Button>
              </MDBox>
              <MDBox pt={3}>
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" py={5}>
                    <CircularProgress />
                  </Box>
                ) : error ? (
                  <Typography color="error">{error}</Typography>
                ) : responses.length === 0 ? (
                  <Typography>Aucune réponse trouvée.</Typography>
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

      {/* Dialog détail réponse */}
      <Dialog open={!!selectedResponseId} onClose={handleCloseDetail} maxWidth="md" fullWidth>
        <DialogTitle>
          Détail de la réponse
          <IconButton
            aria-label="close"
            onClick={handleCloseDetail}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={5}>
              <CircularProgress />
            </Box>
          ) : selectedResponseDatas ? (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                Infos principales
              </Typography>
              <Box mb={2}>
                <Typography>ID: {selectedResponseDatas.response_form.id}</Typography>
                <Typography>
                  Formulaire: {selectedResponseDatas.response_form.form_title}
                </Typography>
                <Typography>
                  Créé par: {selectedResponseDatas.response_form.created_by} (
                  {selectedResponseDatas.response_form.created_by_email})
                </Typography>
                <Typography>
                  Date: {new Date(selectedResponseDatas.response_form.created_at).toLocaleString()}
                </Typography>
                <Typography>Latitude: {selectedResponseDatas.response_form.latitude}</Typography>
                <Typography>Longitude: {selectedResponseDatas.response_form.longitude}</Typography>
              </Box>
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                Réponses aux paramètres
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                {selectedResponseDatas.parameter_responses.map((pr) => (
                  <li key={pr.id} style={{ marginBottom: 8 }}>
                    <Typography>
                      <b>{pr.parameter_libelle}</b> ({pr.parameter_type}) : {pr.value}
                      {pr.observation ? (
                        <span style={{ color: "#888", marginLeft: 8 }}>
                          [Obs: {pr.observation}]
                        </span>
                      ) : null}
                    </Typography>
                    {pr.modalities && pr.modalities.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        Modalités: {pr.modalities.map((m) => m.libelle).join(", ")}
                      </Typography>
                    )}
                  </li>
                ))}
              </Box>
            </Box>
          ) : (
            <Typography color="error">Erreur lors du chargement du détail.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetail} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
