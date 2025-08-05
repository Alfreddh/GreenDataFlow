import React from "react";
import {
  Card,
  Grid,
  Avatar,
  Button,
  Box,
  TextField,
  Typography,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useAuth } from "../../context/AuthContext";
import SettingsIcon from "@mui/icons-material/Settings";
import MailIcon from "@mui/icons-material/Mail";
import HomeIcon from "@mui/icons-material/Home";
import MessageIcon from "@mui/icons-material/MailOutline";

const getUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
  } catch (e) {}
  return null;
};

export default function ProfilePage() {
  const { user: contextUser } = useAuth ? useAuth() : { user: null };
  const user = contextUser || getUser() || {};
  const {
    fullName,
    email = "fidelebodehou@gmail.com",
    avatar = "https://randomuser.me/api/portraits/men/44.jpg",
    phone,
    role = "Admin",
  } = user;
  const displayName = fullName && fullName.trim() ? fullName : "John Doe";
  const displayPhone = phone && phone.trim() ? phone : "00000000";
  const [tab, setTab] = React.useState(0);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {/* Bannière avec overlay vert */}
      <Box
        sx={{
          width: "100%",
          height: { xs: 180, md: 260 },
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          background: `linear-gradient(rgba(60,150,60,0.55), rgba(60,150,60,0.55)), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80') center/cover`,
        }}
      />
      <Grid container justifyContent="center" sx={{ mt: -12, mb: 4 }}>
        <Grid item xs={12} md={10} lg={9}>
          <Card
            sx={{
              p: { xs: 2, md: 4 },
              borderRadius: 3,
              boxShadow: 3,
              background: "#fff",
              position: "relative",
              overflow: "visible",
            }}
          >
            {/* Avatar, nom, email alignés à gauche avant les infos du profil */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                mt: 2,
                mb: 2,
              }}
            >
              <Avatar
                src={avatar}
                alt={displayName}
                sx={{ width: 70, height: 70, boxShadow: 2, border: "3px solid #fff", mb: 1 }}
              />
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0 }}>
                {displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {email}
              </Typography>
            </Box>

            {/* Section infos profil */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                Informations du profil
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Adresse email"
                    value={email}
                    fullWidth
                    disabled
                    variant="outlined"
                    InputProps={{ style: { borderRadius: 10, background: "#fafbfc" } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Nom"
                    value={displayName}
                    fullWidth
                    disabled
                    variant="outlined"
                    InputProps={{ style: { borderRadius: 10, background: "#fafbfc" } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Numéro de téléphone"
                    value={displayPhone}
                    fullWidth
                    disabled
                    variant="outlined"
                    InputProps={{ style: { borderRadius: 10, background: "#fafbfc" } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Mot de passe"
                    value={"*********"}
                    type="password"
                    fullWidth
                    disabled
                    variant="outlined"
                    InputProps={{ style: { borderRadius: 10, background: "#fafbfc" } }}
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                sx={{
                  mt: 4,
                  background: "#222",
                  color: "#fff",
                  borderRadius: 2,
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  boxShadow: 2,
                  textTransform: "uppercase",
                  fontSize: 15,
                  letterSpacing: 0.5,
                  "&:hover": { background: "#111" },
                }}
              >
                MODIFIER LES INFOS
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
      <Footer />
    </DashboardLayout>
  );
}
