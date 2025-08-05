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

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import Card from "@mui/material/Card";
import MDTypography from "components/MDTypography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import DataTable from "examples/Tables/DataTable";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { formService } from "../../services/api";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import CircularProgress from "@mui/material/CircularProgress";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
Chart.register(ArcElement, Tooltip, Legend);

// Données fictives
const stats = [
  {
    color: "info",
    icon: "description",
    title: "Formulaires créés",
    count: 42,
    percentage: { color: "success", amount: "+8%", label: "cette semaine" },
  },
  {
    color: "success",
    icon: "assignment_turned_in",
    title: "Réponses collectées",
    count: 1287,
    percentage: { color: "success", amount: "+12%", label: "ce mois-ci" },
  },
  {
    color: "warning",
    icon: "hourglass_empty",
    title: "Collectes en cours",
    count: 5,
    percentage: { color: "warning", amount: "-1", label: "en pause" },
  },
  {
    color: "primary",
    icon: "people",
    title: "Utilisateurs actifs",
    count: 17,
    percentage: { color: "success", amount: "+2", label: "cette semaine" },
  },
];

const evolutionData = {
  labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  datasets: [
    {
      label: "Réponses",
      data: [120, 150, 180, 200, 170, 220, 250],
    },
  ],
};

const repartitionData = {
  labels: ["Satisfaction", "Inscription", "Contact", "Réservation", "Devis"],
  datasets: [
    {
      label: "Réponses",
      backgroundColor: "#77af0a",
      data: [400, 320, 180, 220, 165],
    },
  ],
};

const derniersFormulaires = [
  { titre: "Satisfaction client", date: "2024-06-20", statut: "En ligne", reponses: 400 },
  { titre: "Inscription newsletter", date: "2024-06-18", statut: "En ligne", reponses: 320 },
  { titre: "Contact général", date: "2024-06-15", statut: "Brouillon", reponses: 0 },
  { titre: "Réservation événement", date: "2024-06-10", statut: "En ligne", reponses: 220 },
  { titre: "Demande de devis", date: "2024-06-08", statut: "Archivé", reponses: 165 },
];

const statutColor = (statut) => {
  if (statut === "En ligne") return "success";
  if (statut === "Brouillon") return "warning";
  if (statut === "Archivé") return "default";
  return "info";
};

const derniersFormulairesData = () => {
  const Status = ({ status }) => (
    <Chip
      label={status}
      size="small"
      color={statutColor(status)}
      sx={{
        fontWeight: 600,
        fontSize: 12,
        px: 1,
        borderRadius: 1,
        backgroundColor: status === "En ligne" ? "#77af0a" : undefined,
        color: status === "En ligne" ? "#fff" : undefined,
      }}
    />
  );
  Status.propTypes = {
    status: PropTypes.string.isRequired,
  };
  return {
    columns: [
      { Header: "Titre", accessor: "titre", width: "40%", align: "left" },
      { Header: "Date", accessor: "date", align: "center" },
      { Header: "Statut", accessor: "statut", align: "center" },
      { Header: "Réponses", accessor: "reponses", align: "center" },
    ],
    rows: derniersFormulaires.map((f) => ({
      titre: (
        <MDTypography fontSize={14} noWrap>
          {f.titre}
        </MDTypography>
      ),
      date: (
        <MDTypography fontSize={13} color="text.secondary">
          {f.date}
        </MDTypography>
      ),
      statut: <Status status={f.statut} />,
      reponses: (
        <MDTypography fontSize={14} color="info.main" fontWeight={600}>
          {f.reponses}
        </MDTypography>
      ),
    })),
  };
};

function Dashboard() {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState("");
  const [formResponses, setFormResponses] = useState([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  // Charger la liste des formulaires au montage
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const res = await formService.getAllForms();
        setForms(res?.results?.data || []);
        if (res?.results?.data?.length > 0) {
          setSelectedFormId(res.results.data[0].id);
        }
      } catch (e) {
        setForms([]);
      }
    };
    fetchForms();
  }, []);

  // Charger les réponses du formulaire sélectionné (fictives)
  useEffect(() => {
    const generateFakeResponses = () => {
      if (!selectedFormId) return;
      setLoadingResponses(true);
      // Trouver le formulaire sélectionné
      const form = forms.find((f) => f.id === selectedFormId);
      if (!form || !Array.isArray(form.parameters)) {
        setFormResponses([]);
        setLoadingResponses(false);
        return;
      }
      // Générer 10 réponses aléatoires
      const fakeResponses = Array.from({ length: 10 }).map((_, idx) => {
        const resp = { id: idx + 1 };
        form.parameters.forEach((q) => {
          switch (q.type) {
            case "texte":
              resp[q.libelle || q.label || `Q${q.order}`] = `Réponse texte ${idx + 1}`;
              break;
            case "nombre_entier":
              resp[q.libelle || q.label || `Q${q.order}`] = Math.floor(Math.random() * 100);
              break;
            case "nombre_decimal":
              resp[q.libelle || q.label || `Q${q.order}`] = (Math.random() * 100).toFixed(2);
              break;
            case "binaire":
              resp[q.libelle || q.label || `Q${q.order}`] = Math.random() > 0.5 ? "Oui" : "Non";
              break;
            case "choix_unique":
            case "choix_multiple":
            case "liste_deroulante":
              if (Array.isArray(q.options) && q.options.length > 0) {
                const opt = q.options[Math.floor(Math.random() * q.options.length)];
                resp[q.libelle || q.label || `Q${q.order}`] = opt;
              } else {
                resp[q.libelle || q.label || `Q${q.order}`] = "-";
              }
              break;
            case "date":
              resp[q.libelle || q.label || `Q${q.order}`] = new Date(
                Date.now() - Math.random() * 1e10
              ).toLocaleDateString();
              break;
            case "datetime":
              resp[q.libelle || q.label || `Q${q.order}`] = new Date(
                Date.now() - Math.random() * 1e10
              ).toLocaleString();
              break;
            default:
              resp[q.libelle || q.label || `Q${q.order}`] = "-";
          }
        });
        resp["Date de soumission"] = new Date(Date.now() - Math.random() * 1e10).toLocaleString();
        return resp;
      });
      setFormResponses(fakeResponses);
      setLoadingResponses(false);
    };
    generateFakeResponses();
  }, [selectedFormId, forms]);

  // Colonnes dynamiques selon les réponses (affiche les 5 premiers champs)
  const responseColumns =
    formResponses.length > 0
      ? Object.keys(formResponses[0])
          .slice(0, 5)
          .map((key) => ({
            Header: key,
            accessor: key,
            align: "left",
          }))
      : [];
  // Lignes du tableau
  const responseRows = formResponses.map((resp) => {
    const row = {};
    responseColumns.forEach((col) => {
      row[col.accessor] = (
        <MDTypography fontSize={13} color="text.secondary">
          {typeof resp[col.accessor] === "object"
            ? JSON.stringify(resp[col.accessor])
            : String(resp[col.accessor] ?? "")}
        </MDTypography>
      );
    });
    return row;
  });

  // Statistiques dynamiques à partir des réponses
  const totalResponses = formResponses.length;
  const lastSubmission =
    formResponses.length > 0
      ? formResponses
          .reduce((latest, r) => {
            const d = new Date(r["Date de soumission"]);
            return d > latest ? d : latest;
          }, new Date(0))
          .toLocaleString()
      : "-";

  // Trouver la première question numérique pour la moyenne
  let numericKey = null;
  if (formResponses.length > 0) {
    const keys = Object.keys(formResponses[0]);
    for (const k of keys) {
      if (formResponses.some((r) => !isNaN(parseFloat(r[k])) && isFinite(r[k]))) {
        numericKey = k;
        break;
      }
    }
  }
  const numericAvg =
    numericKey && formResponses.length > 0
      ? (
          formResponses.reduce((sum, r) => sum + (parseFloat(r[numericKey]) || 0), 0) /
          totalResponses
        ).toFixed(2)
      : "-";

  // Trouver la première question à choix pour la répartition
  let choiceKey = null;
  let choiceOptions = [];
  if (forms.length > 0 && selectedFormId) {
    const form = forms.find((f) => f.id === selectedFormId);
    if (form && Array.isArray(form.parameters)) {
      const q = form.parameters.find((q) =>
        ["choix_unique", "choix_multiple", "binaire", "liste_deroulante"].includes(q.type)
      );
      if (q) {
        choiceKey = q.libelle || q.label || `Q${q.order}`;
        choiceOptions =
          Array.isArray(q.options) && q.options.length > 0 ? q.options : ["Oui", "Non"];
      }
    }
  }
  // Répartition des réponses pour la question à choix
  let choiceCounts = {};
  if (choiceKey) {
    choiceCounts = choiceOptions.reduce((acc, opt) => {
      acc[opt] = formResponses.filter((r) => r[choiceKey] === opt).length;
      return acc;
    }, {});
  }

  // Nouvelle statistique : taux Oui/Non sur la première question binaire
  let binaryKey = null;
  if (forms.length > 0 && selectedFormId) {
    const form = forms.find((f) => f.id === selectedFormId);
    if (form && Array.isArray(form.parameters)) {
      const q = form.parameters.find((q) => q.type === "binaire");
      if (q) {
        binaryKey = q.libelle || q.label || `Q${q.order}`;
      }
    }
  }
  let binaryYes = 0,
    binaryNo = 0;
  if (binaryKey) {
    binaryYes = formResponses.filter((r) => r[binaryKey] === "Oui").length;
    binaryNo = formResponses.filter((r) => r[binaryKey] === "Non").length;
  }
  const binaryRate =
    binaryKey && totalResponses > 0
      ? `${((binaryYes / totalResponses) * 100).toFixed(0)}% Oui`
      : "-";

  // Nouvelle statistique : date de première soumission
  const firstSubmission =
    formResponses.length > 0
      ? formResponses
          .reduce((earliest, r) => {
            const d = new Date(r["Date de soumission"]);
            return d < earliest ? d : earliest;
          }, new Date())
          .toLocaleString()
      : "-";

  // Statistique supplémentaire : nombre de réponses aujourd'hui
  const today = new Date().toLocaleDateString();
  const todayCount = formResponses.filter((r) => {
    const d = r["Date de soumission"] ? new Date(r["Date de soumission"]).toLocaleDateString() : "";
    return d === today;
  }).length;

  // Données pour le line chart (évolution des réponses par jour)
  const dateCounts = {};
  formResponses.forEach((r) => {
    const d = r["Date de soumission"]
      ? new Date(r["Date de soumission"]).toLocaleDateString()
      : "-";
    dateCounts[d] = (dateCounts[d] || 0) + 1;
  });
  const lineLabels = Object.keys(dateCounts);
  const lineData = Object.values(dateCounts);

  // Données pour le bar chart (répartition des choix)
  const barLabels = choiceOptions;
  const barData = choiceOptions.map((opt) => choiceCounts[opt] || 0);

  // Données pour le pie chart (répartition sur la question à choix)
  const pieData = {
    labels: barLabels,
    datasets: [
      {
        data: barData,
        backgroundColor: [
          "#77af0a",
          "#ffa726",
          "#42a5f5",
          "#ab47bc",
          "#ef5350",
          "#26a69a",
          "#ff7043",
        ],
      },
    ],
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {/* Dropdown de sélection du formulaire */}
      <MDBox px={3} pt={2} pb={1} mb={3}>
        <Select
          value={selectedFormId}
          onChange={(e) => setSelectedFormId(e.target.value)}
          displayEmpty
          fullWidth
          sx={{ maxWidth: 400, background: "#fff", borderRadius: 2, minHeight: 48, fontSize: 18 }}
        >
          {forms.map((form) => (
            <MenuItem key={form.id} value={form.id}>
              {form.title}
            </MenuItem>
          ))}
        </Select>
      </MDBox>
      {/* Statistiques globales dynamiques */}
      <MDBox py={2} mb={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} lg={3}>
            <ComplexStatisticsCard
              color="info"
              icon="assignment_turned_in"
              title="Réponses collectées"
              count={totalResponses}
              percentage={{ color: "success", amount: "", label: "total" }}
            />
          </Grid>
          <Grid item xs={12} md={3} lg={3}>
            <ComplexStatisticsCard
              color="success"
              icon="check_circle"
              title={binaryKey ? `Taux Oui (${binaryKey})` : "Aucune question binaire"}
              count={binaryRate}
              percentage={{ color: "info", amount: "", label: "" }}
            />
          </Grid>
          <Grid item xs={12} md={3} lg={3}>
            <ComplexStatisticsCard
              color="primary"
              icon="calculate"
              title={numericKey ? `Moyenne (${numericKey})` : "Aucune question numérique"}
              count={numericAvg}
              percentage={{ color: "info", amount: "", label: "" }}
            />
          </Grid>
          <Grid item xs={12} md={3} lg={3}>
            <ComplexStatisticsCard
              color="warning"
              icon="today"
              title="Réponses aujourd'hui"
              count={todayCount}
              percentage={{ color: "info", amount: "", label: "" }}
            />
          </Grid>
        </Grid>
      </MDBox>
      {/* Graphiques dynamiques */}
      <MDBox mt={2} mb={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <ReportsLineChart
              color="info"
              title="Évolution des réponses"
              description="Nombre de réponses par jour"
              date=""
              chart={{ labels: lineLabels, datasets: [{ label: "Réponses", data: lineData }] }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ReportsBarChart
              color="success"
              title={
                choiceKey ? `Répartition des réponses (${choiceKey})` : "Aucune question à choix"
              }
              description="Nombre de réponses par option"
              date=""
              chart={{
                labels: barLabels,
                datasets: [{ label: "Réponses", backgroundColor: "#77af0a", data: barData }],
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ReportsBarChart
              color="warning"
              title={
                choiceKey ? `Histogramme des réponses (${choiceKey})` : "Aucune question à choix"
              }
              description="Histogramme des réponses par option"
              date=""
              chart={{
                labels: barLabels,
                datasets: [{ label: "Réponses", backgroundColor: "#ffa726", data: barData }],
              }}
            />
          </Grid>
        </Grid>
      </MDBox>
      {/* Tableau des réponses */}
      <MDBox py={3} mb={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 0, borderRadius: 3, boxShadow: 2 }}>
              <MDBox p={2} pb={1}>
                <MDTypography variant="h6" fontWeight="bold" mb={1} color="primary">
                  Dernières réponses du formulaire
                </MDTypography>
                <MDBox pt={2}>
                  {loadingResponses ? (
                    <Box display="flex" justifyContent="center" alignItems="center" py={5}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <DataTable
                      table={{ columns: responseColumns, rows: responseRows }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                  )}
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
