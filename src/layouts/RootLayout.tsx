import { Outlet, NavLink, useLocation } from "react-router";
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  LinearProgress,
  Stack,
  Toolbar,
  Typography,
  type ButtonProps,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MenuIcon from "@mui/icons-material/Menu";
import PetsIcon from "@mui/icons-material/Pets";
import { useIsFetching } from "@tanstack/react-query";
import { useFavourites } from "../store/useFavorites";
import { useEffect, useState } from "react";

// A tiny helper so NavLink + MUI plays nicely with "active" state styling
function NavButton(props: ButtonProps & { to: string }) {
  const { to, ...rest } = props;
  return (
    <Button
      component={NavLink}
      to={to}
      sx={{
        color: "inherit",
        ":hover": {
          bgcolor: "primary.dark",
          color: "secondary.light",
        },
        "&[aria-current='page']": {
          bgcolor: "primary.dark",
        },
      }}
      {...rest}
    />
  );
}

export default function RootLayout() {
  const isFetching = useIsFetching(); // number of active queries

  return (
    <Box
      sx={{
        width: "100dvw",
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
          <NavigationMenu />
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

const NavigationMenu = () => {
  const location = useLocation();
  const { items } = useFavourites();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [location]);

  const FavoritesIcon = () => (
    <Badge
      color="secondary"
      badgeContent={items.length}
      invisible={!items.length}
    >
      <FavoriteIcon fontSize="small" />
    </Badge>
  );

  const BurgerButton = () => (
    <IconButton
      edge="start"
      color="inherit"
      aria-label="open drawer"
      onClick={() => setOpen(true)}
      sx={{ mr: 2, display: { xs: "block", sm: "none" } }}
    >
      <MenuIcon />
    </IconButton>
  );

  const NavButtons = () => (
    <>
      <NavButton to="/">Feed</NavButton>
      <NavButton to="/breeds">Breeds</NavButton>
      <NavButton to="/favourites" startIcon={<FavoritesIcon />}>
        Favourites
      </NavButton>
    </>
  );

  return (
    <>
      <Drawer
        anchor="right"
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
      >
        <Stack direction="column" spacing={1} padding={3}>
          <NavButtons />
        </Stack>
      </Drawer>

      <Stack direction="row" spacing={1}>
        <BurgerButton />

        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          <NavButtons />
        </Box>
      </Stack>
    </>
  );
};
