import { Link as RouterLink, useLocation } from "react-router";
import {
  Box,
  Button,
  Container,
  ImageList,
  ImageListItem,
  IconButton,
  Stack,
  Typography,
  Tooltip,
  Skeleton,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PetsIcon from "@mui/icons-material/Pets";
import { useFavourites } from "../store/useFavorites";

export default function Favourites() {
  const { items, remove } = useFavourites();
  const location = useLocation();

  // Simple first-load skeleton if someone navigates here before the hook hydrates
  const loadingFirstPaint = items === undefined;

  if (loadingFirstPaint) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Favourites
        </Typography>
        <ImageList variant="masonry" cols={3} gap={8} sx={{ m: 0 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <Box key={i}>
              <Skeleton variant="rounded" height={220} />
            </Box>
          ))}
        </ImageList>
      </Container>
    );
  }

  const isEmpty = !items?.length;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h4" component="h1">
          Favourites {items.length ? `(${items.length})` : ""}
        </Typography>
      </Stack>

      {isEmpty ? (
        <Box
          sx={{
            py: 10,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <PetsIcon fontSize="large" />
          <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
            No favourites yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add some cats from the feed or a breed gallery.
          </Typography>

          <Stack direction="row" spacing={1} justifyContent="center">
            <Button component={RouterLink} to="/">
              Go to Feed
            </Button>
            <Button component={RouterLink} to="/breeds" variant="outlined">
              Browse Breeds
            </Button>
          </Stack>
        </Box>
      ) : (
        <ImageList variant="masonry" cols={3} gap={8} sx={{ m: 0 }}>
          {items.map((item) => (
            <ImageListItem key={item.id} data-testid={`fav-${item.id}`}>
              <Box
                component={RouterLink}
                to={`/images/${item.id}`}
                state={{ backgroundLocation: location }}
                sx={{
                  display: "block",
                  position: "relative",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover img": { transform: "scale(1.02)" },
                }}
              >
                <Box
                  component="img"
                  src={item.url}
                  alt="Favourite cat"
                  loading="lazy"
                  sx={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    transition: "transform 200ms ease",
                  }}
                />

                {/* Remove button overlay (doesn't trigger the link) */}
                <Tooltip title="Remove">
                  <IconButton
                    aria-label="Remove"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      remove(item.id);
                    }}
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover": { bgcolor: "background.paper" },
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </Container>
  );
}
