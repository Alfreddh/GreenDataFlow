import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  FormControl,
  FormLabel,
  Paper,
  Button,
  Select,
  MenuItem,
  Switch,
  Slider,
  Input,
  Modal,
} from "@mui/material";
import { DatePicker, TimePicker, DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { fr } from "date-fns/locale";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import { formService } from "../../services/api";

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

MapClickHandler.propTypes = {
  onClick: PropTypes.func.isRequired,
};

function PositionField({ value, onChange }) {
  const [position, setPosition] = React.useState({
    lat: value?.lat !== undefined && value?.lat !== "" ? parseFloat(value.lat) : 6.3703,
    lng: value?.lng !== undefined && value?.lng !== "" ? parseFloat(value.lng) : 2.3912,
    precision: value?.precision !== undefined && value?.precision !== "" ? value.precision : 10,
  });

  React.useEffect(() => {
    setPosition({
      lat: value?.lat !== undefined && value?.lat !== "" ? parseFloat(value.lat) : 6.3703,
      lng: value?.lng !== undefined && value?.lng !== "" ? parseFloat(value.lng) : 2.3912,
      precision: value?.precision !== undefined && value?.precision !== "" ? value.precision : 10,
    });
  }, [value]);

  const handleMapClick = (latlng) => {
    const newValue = {
      lat: latlng.lat,
      lng: latlng.lng,
      precision: 5,
    };
    setPosition(newValue);
    if (onChange) onChange(newValue);
  };

  const handleFieldChange = (field, val) => {
    const newValue = { ...position, [field]: val };
    setPosition(newValue);
    if (onChange) onChange(newValue);
  };

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexWrap: "wrap" }}>
      <Box sx={{ minWidth: 220, flex: 1 }}>
        <TextField
          label="Latitude"
          value={position.lat}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
          onChange={(e) => handleFieldChange("lat", parseFloat(e.target.value))}
        />
        <TextField
          label="Longitude"
          value={position.lng}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
          onChange={(e) => handleFieldChange("lng", parseFloat(e.target.value))}
        />
        <TextField
          label="Précision (m)"
          value={position.precision}
          size="small"
          fullWidth
          sx={{ mb: 1 }}
          onChange={(e) => handleFieldChange("precision", e.target.value)}
        />
      </Box>
      <Box sx={{ minWidth: 260, height: 180, flex: 1 }}>
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={13}
          style={{ width: "100%", height: 180, borderRadius: 8 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <Marker position={[position.lat, position.lng]} />
          <MapClickHandler onClick={handleMapClick} />
        </MapContainer>
      </Box>
    </Box>
  );
}

PositionField.propTypes = {
  value: PropTypes.shape({
    lat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lng: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    precision: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  onChange: PropTypes.func,
};

const Apercu = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [responses, setResponses] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    async function fetchForm() {
      if (id) {
        // Essaye d'abord le localStorage, sinon API
        let form = null;
        const saved = localStorage.getItem(`form_${id}`);
        if (saved) {
          form = JSON.parse(saved);
        } else {
          try {
            const res = await formService.getFormById(id);
            if (res && res.success && res.data) {
              form = {
                title: res.data.title,
                image: res.data.cover_image,
                description: res.data.description,
                questions: (res.data.parameters || []).map((param, idx) => ({
                  id: param.id || `q_${idx + 1}`,
                  label: param.libelle,
                  type: param.type, // adapte si besoin
                  required: param.is_required,
                  options: param.modalities?.map((m) => m.libelle) || [],
                  active: false,
                })),
              };
            }
          } catch (e) {
            // ignore
          }
        }
        if (form) {
          setFormData(form);
          // Initialiser les réponses
          const initialResponses = {};
          form.questions.forEach((q) => {
            initialResponses[q.id] = q.type === "choix_multiple" ? [] : "";
          });
          setResponses(initialResponses);
        }
      } else {
        // Ancien comportement : localStorage 'formData'
        const savedForm = localStorage.getItem("formData");
        if (savedForm) {
          const form = JSON.parse(savedForm);
          setFormData(form);
          const initialResponses = {};
          form.questions.forEach((q) => {
            initialResponses[q.id] = q.type === "choix_multiple" ? [] : "";
          });
          setResponses(initialResponses);
        }
      }
    }
    fetchForm();
  }, [id]);

  const handleResponseChange = (questionId, value, type) => {
    setResponses((prev) => {
      if (type === "choix_multiple") {
        const currentValues = prev[questionId] || [];
        if (currentValues.includes(value)) {
          return {
            ...prev,
            [questionId]: currentValues.filter((v) => v !== value),
          };
        } else {
          return {
            ...prev,
            [questionId]: [...currentValues, value],
          };
        }
      }
      return {
        ...prev,
        [questionId]: value,
      };
    });
  };

  const renderQuestion = (question) => {
    console.log(question); // Debug: voir le type de chaque question
    switch (question.type) {
      case "texte":
        return (
          <TextField
            fullWidth
            variant="outlined"
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Votre réponse"
          />
        );

      case "nombre_entier":
        return (
          <TextField
            fullWidth
            type="number"
            variant="outlined"
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Entrez un nombre entier"
            inputProps={{ step: 1 }}
          />
        );

      case "nombre_decimal":
        return (
          <TextField
            fullWidth
            type="number"
            variant="outlined"
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Entrez un nombre décimal"
            inputProps={{ step: "any" }}
          />
        );

      case "binaire":
        return (
          <RadioGroup
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
          >
            {(question.options.length === 2 ? question.options : ["Oui", "Non"]).map((opt, idx) => (
              <FormControlLabel
                key={idx}
                value={opt}
                control={<Radio />}
                label={opt}
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: "1rem",
                  },
                }}
              />
            ))}
          </RadioGroup>
        );

      case "choix_unique":
        return (
          <RadioGroup
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
          >
            {question.options.map((opt, idx) => (
              <FormControlLabel key={idx} value={opt} control={<Radio />} label={opt} />
            ))}
          </RadioGroup>
        );

      case "choix_multiple":
        return (
          <Box>
            {question.options.map((opt, idx) => (
              <FormControlLabel
                key={idx}
                control={
                  <Checkbox
                    checked={(responses[question.id] || []).includes(opt)}
                    onChange={() => handleResponseChange(question.id, opt, "choix_multiple")}
                  />
                }
                label={opt}
              />
            ))}
          </Box>
        );

      case "liste_deroulante":
        return (
          <Select
            fullWidth
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Sélectionner une option
            </MenuItem>
            {question.options.map((opt, idx) => (
              <MenuItem key={idx} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        );

      case "media":
      case "fichier":
        return (
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ justifyContent: "flex-start", my: 1 }}
          >
            Ajouter un fichier
            <Input
              type="file"
              hidden
              onChange={(e) => handleResponseChange(question.id, e.target.files[0])}
            />
          </Button>
        );

      case "datetime":
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DateTimePicker
              label="Sélectionnez une date et heure"
              value={responses[question.id] || null}
              onChange={(value) => handleResponseChange(question.id, value)}
              slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
            />
          </LocalizationProvider>
        );

      case "date":
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DatePicker
              label="Sélectionnez une date"
              value={responses[question.id] || null}
              onChange={(value) => handleResponseChange(question.id, value)}
              slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
            />
          </LocalizationProvider>
        );

      case "heure":
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <TimePicker
              label="Sélectionnez une heure"
              value={responses[question.id] || null}
              onChange={(value) => handleResponseChange(question.id, value)}
              slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
            />
          </LocalizationProvider>
        );

      case "note":
        return (
          <TextField
            fullWidth
            variant="outlined"
            multiline
            minRows={3}
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Votre note"
          />
        );

      case "ligne":
        return <Box sx={{ borderTop: "2px solid #77af0a", my: 2 }} />;

      case "zone":
        return (
          <TextField
            fullWidth
            variant="outlined"
            multiline
            minRows={4}
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Votre zone de texte"
          />
        );

      case "tableau":
        // Affiche un tableau avec 3 lignes et 3 colonnes de champs texte pour l'aperçu
        return (
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
              <tbody>
                {[0, 1, 2].map((rowIdx) => (
                  <tr key={rowIdx}>
                    {[0, 1, 2].map((colIdx) => (
                      <td key={colIdx} style={{ border: "1px solid #ccc", padding: 4 }}>
                        <TextField
                          size="small"
                          variant="outlined"
                          value={responses[question.id]?.[rowIdx]?.[colIdx] || ""}
                          onChange={(e) => {
                            setResponses((prev) => {
                              const table = prev[question.id] || [[], [], []];
                              const newTable = table.map((row, r) =>
                                r === rowIdx
                                  ? row.map((cell, c) =>
                                      c === colIdx ? e.target.value : cell || ""
                                    )
                                  : row.map((cell) => cell || "")
                              );
                              // Si la ligne n'existe pas
                              if (!newTable[rowIdx]) newTable[rowIdx] = ["", "", ""];
                              if (!newTable[rowIdx][colIdx]) newTable[rowIdx][colIdx] = "";
                              newTable[rowIdx][colIdx] = e.target.value;
                              return { ...prev, [question.id]: newTable };
                            });
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        );

      case "classement":
        // Affiche une liste ordonnable simple (drag & drop non implémenté, mais champs de classement)
        return (
          <Box>
            {(question.options && question.options.length > 0
              ? question.options
              : ["Option 1", "Option 2", "Option 3"]
            ).map((opt, idx) => (
              <Box key={idx} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <TextField
                  type="number"
                  size="small"
                  variant="outlined"
                  value={
                    responses[question.id]?.[opt] !== undefined
                      ? responses[question.id][opt]
                      : idx + 1
                  }
                  onChange={(e) => {
                    setResponses((prev) => ({
                      ...prev,
                      [question.id]: {
                        ...(prev[question.id] || {}),
                        [opt]: e.target.value,
                      },
                    }));
                  }}
                  sx={{ width: 60, mr: 2 }}
                  inputProps={{ min: 1, max: 10 }}
                />
                <Typography>{opt}</Typography>
              </Box>
            ))}
          </Box>
        );

      case "calcul":
        return (
          <TextField
            fullWidth
            variant="outlined"
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Champ calculé (saisi pour l'aperçu)"
          />
        );

      case "intervalle":
        return (
          <Box sx={{ px: 2 }}>
            <Slider
              value={typeof responses[question.id] === "number" ? responses[question.id] : 0}
              onChange={(_, value) => handleResponseChange(question.id, value)}
              min={0}
              max={100}
              step={1}
              valueLabelDisplay="auto"
            />
          </Box>
        );

      case "xml":
        // Champ texte multilignes pour saisir du XML
        return (
          <TextField
            fullWidth
            variant="outlined"
            multiline
            minRows={4}
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Saisir du XML ici..."
          />
        );

      case "cache":
        return (
          <Switch
            checked={!!responses[question.id]}
            onChange={(e) => handleResponseChange(question.id, e.target.checked)}
          />
        );

      case "qrcode":
        return (
          <TextField
            fullWidth
            variant="outlined"
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Scanner ou saisir le code barre/QR"
          />
        );

      case "consentir":
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!responses[question.id]}
                onChange={(e) => handleResponseChange(question.id, e.target.checked)}
              />
            }
            label="Je consens"
          />
        );

      case "audio":
        return (
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ justifyContent: "flex-start", my: 1 }}
          >
            Ajouter un fichier audio
            <Input
              type="file"
              inputProps={{ accept: "audio/*" }}
              hidden
              onChange={(e) => handleResponseChange(question.id, e.target.files[0])}
            />
          </Button>
        );

      case "video":
        return (
          <Button
            variant="outlined"
            component="label"
            fullWidth
            sx={{ justifyContent: "flex-start", my: 1 }}
          >
            Ajouter un fichier vidéo
            <Input
              type="file"
              inputProps={{ accept: "video/*" }}
              hidden
              onChange={(e) => handleResponseChange(question.id, e.target.files[0])}
            />
          </Button>
        );

      case "position":
        // On stocke la valeur comme un objet {lat, lng, precision}
        const posValue =
          typeof responses[question.id] === "object" && responses[question.id] !== null
            ? responses[question.id]
            : {};
        return (
          <PositionField
            value={posValue}
            onChange={(newValue) => setResponses((prev) => ({ ...prev, [question.id]: newValue }))}
          />
        );

      default:
        // Fallback pour type inconnu ou vide
        return (
          <TextField
            fullWidth
            variant="outlined"
            value={responses[question.id] || ""}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Votre réponse"
          />
        );
    }
  };

  return (
    <>
      {/* Contenu principal de l'aperçu (toujours visible) */}
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, mb: 4 }}>
        {formData && (
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 2,
              backgroundColor: "#fff",
            }}
          >
            {/* En-tête du formulaire */}
            {formData.image && (
              <Box sx={{ mb: 3, textAlign: "center" }}>
                <img
                  src={formData.image}
                  alt="form"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "200px",
                    objectFit: "contain",
                  }}
                />
              </Box>
            )}

            <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
              {formData.title}
            </Typography>

            <Typography variant="body1" sx={{ mb: 4, color: "#666" }}>
              {formData.description}
            </Typography>

            {/* Questions */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {formData.questions.map((question, index) => (
                <Box key={question.id}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {question.label}
                    {question.required && <span style={{ color: "red", marginLeft: 4 }}>*</span>}
                  </Typography>
                  {renderQuestion(question)}
                </Box>
              ))}
            </Box>

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  // Sauvegarder les réponses
                  localStorage.setItem("formResponses", JSON.stringify(responses));
                  alert("Réponses enregistrées !");
                }}
              >
                Soumettre
              </Button>
            </Box>
          </Paper>
        )}
      </Box>
      {/* Modal d'aperçu stylisé, superposé */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        aria-labelledby="preview-modal"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            width: "90%",
            maxWidth: 900,
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 0,
            mt: 4,
            mb: 4,
          }}
        >
          {/* Header vert fidèle au design */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "#77af0a",
              color: "#fff",
              height: 56,
              px: 3,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              borderBottom: "4px solid #e65100",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <img
                src="/favicon.png"
                alt="logo"
                style={{ width: 32, height: 32, marginRight: 12 }}
              />
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", fontSize: "1.1rem", color: "#fff" }}
              >
                Aperçu du formulaire
              </Typography>
            </Box>
            <Button
              onClick={() => setPreviewOpen(false)}
              sx={{ color: "#fff", minWidth: 0, p: 0, ml: 2 }}
            >
              <span style={{ fontSize: 28, fontWeight: "bold" }}>&times;</span>
            </Button>
          </Box>
          <Box sx={{ p: 4 }}>
            {/* contenu de l'aperçu dans le modal */}
            {formData && (
              <>
                {formData.image && (
                  <Box sx={{ mb: 3, textAlign: "center" }}>
                    <img
                      src={formData.image}
                      alt="form"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                )}
                <Typography variant="h4" sx={{ mb: 2, fontWeight: "bold" }}>
                  {formData.title}
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: "#666" }}>
                  {formData.description}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {formData.questions.map((question, index) => (
                    <Box key={question.id}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        {question.label}
                        {question.required && (
                          <span style={{ color: "red", marginLeft: 4 }}>*</span>
                        )}
                      </Typography>
                      {renderQuestion(question)}
                    </Box>
                  ))}
                </Box>
                <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    onClick={() => setPreviewOpen(false)}
                    sx={{
                      backgroundColor: "#77af0a",
                      "&:hover": {
                        backgroundColor: "#689c09",
                      },
                    }}
                  >
                    Fermer
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default Apercu;
