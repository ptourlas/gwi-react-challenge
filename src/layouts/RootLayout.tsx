import { Outlet, NavLink } from "react-router";
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  LinearProgress,
  Stack,
  Toolbar,
  Typography,
  type ButtonProps,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PetsIcon from "@mui/icons-material/Pets";
import { useIsFetching } from "@tanstack/react-query";
import { useFavourites } from "../store/useFavorites";

// A tiny helper so NavLink + MUI plays nicely with "active" state styling
function NavButton(props: ButtonProps & { to: string }) {
  const { to, ...rest } = props;
  return (
    <Button
      component={NavLink}
      to={to}
      sx={{
        color: "inherit",
        "&[aria-current='page']": {
          bgcolor: "primary.dark",
          color: "primary.contrastText",
        },
      }}
      {...rest}
    />
  );
}

export default function RootLayout() {
  const isFetching = useIsFetching(); // number of active queries
  const { items } = useFavourites();

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      {/* Skip link for accessibility */}
      <AccessibilityLink />

      <AppBar position="sticky" color="primary" enableColorOnDark>
        {isFetching ? <LinearProgress color="secondary" /> : null}
        <Toolbar>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PetsIcon />
            <Typography
              variant="h6"
              component={NavLink}
              to="/"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              CatLover
            </Typography>
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={1}>
            <NavButton to="/">Feed</NavButton>
            <NavButton to="/breeds">Breeds</NavButton>
            <NavButton
              to="/favourites"
              startIcon={
                <Badge
                  color="secondary"
                  badgeContent={items.length}
                  invisible={!items.length}
                >
                  <FavoriteIcon fontSize="small" />
                </Badge>
              }
            >
              Favourites
            </NavButton>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main content area; pages manage their own Container spacing */}
      <Box id="main">
        <Outlet />
      </Box>

      {/* Optional footer */}
      <Box component="footer" sx={{ py: 4 }}>
        <Container maxWidth="md">
          <Typography variant="body2" color="text.secondary" align="center">
            Powered by TheCatAPI • Built with React Router, React Query & MUI
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

const AccessibilityLink = () => (
  <Box
    component="a"
    href="#main"
    sx={{
      position: "absolute",
      left: -10000,
      top: "auto",
      width: 1,
      height: 1,
      overflow: "hidden",
      "&:focus": {
        position: "static",
        width: "auto",
        height: "auto",
        p: 1,
        bgcolor: "background.paper",
      },
    }}
  >
    Skip to content
  </Box>
);

