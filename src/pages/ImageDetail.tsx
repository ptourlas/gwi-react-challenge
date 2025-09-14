import { useState } from "react";
import { Link as RouterLink, useLocation, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  IconButton,
  Link,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useFavourites } from "../store/useFavorites";

type Breed = {
  id: string;
  name: string;
  origin?: string;
  temperament?: string;
  description?: string;
  wikipedia_url?: string;
};

type ImageById = {
  id: string;
  url: string;
  breeds?: Breed[];
};

const API_BASE = "https://api.thecatapi.com/v1";

async function fetchImageById({
  imageId,
  signal,
}: {
  imageId: string;
  signal?: AbortSignal;
}) {
  const headers: Record<string, string> = {};
  const apiKey = import.meta.env.VITE_CAT_API_KEY as string | undefined;
  if (apiKey) headers["x-api-key"] = apiKey;

  const res = await fetch(`${API_BASE}/images/${imageId}`, { headers, signal });
  if (!res.ok)
    throw new Error(res.status === 404 ? "Not found" : `HTTP ${res.status}`);
  const data = (await res.json()) as ImageById;
  return data;
}

export default function ImageDetail() {
  const { imageId = "" } = useParams();
  const location = useLocation();

  // Preserve the original background when nesting modals
  const backgroundLocation =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (location.state as any)?.backgroundLocation || location;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["image", imageId],
    queryFn: ({ signal }) => fetchImageById({ imageId, signal }),
    enabled: !!imageId,
    refetchOnWindowFocus: false,
  });

  const { toggle, isFavourited } = useFavourites();
  const [copied, setCopied] = useState(false);

  const fav = imageId ? isFavourited(imageId) : false;

  const handleToggleFavourite = () => {
    if (!data) return;
    toggle({
      id: data.id,
      url: data.url,
      breedId: data.breeds?.[0]?.id ?? null,
    });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Image Detail
        </Typography>
        <Skeleton variant="rounded" height={420} sx={{ mb: 2 }} />
        <Skeleton height={28} width="60%" />
        <Skeleton height={22} width="40%" />
        <Skeleton height={18} width="90%" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {(error as Error).message || "Failed to load image"}
        </Alert>
      </Container>
    );
  }

  if (!data) return null;

  const breed = data.breeds?.[0];

  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={1}
      >
        <Typography variant="h5" component="h1">
          Image Detail
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={fav ? "Remove from favourites" : "Add to favourites"}>
            <IconButton
              onClick={handleToggleFavourite}
              aria-label={fav ? "Remove from favourites" : "Add to favourites"}
              color={fav ? "error" : "default"}
            >
              {fav ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title={copied ? "Copied!" : "Copy link"}>
            <span>
              <IconButton onClick={copyLink} aria-label="Copy link">
                <ContentCopyIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Open original">
            <IconButton
              component={Link}
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open original image"
            >
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Box
        component="img"
        src={data.url}
        alt={breed ? `${breed.name} cat` : "Cat"}
        loading="eager"
        sx={{
          width: "100%",
          height: "auto",
          display: "block",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          mb: 2,
        }}
      />

      <Divider sx={{ mb: 2 }} />

      {breed ? (
        <Stack spacing={1.5}>
          <Typography variant="h6" component="h2">
            {breed.name}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {breed.origin && (
              <Chip size="small" label={`Origin: ${breed.origin}`} />
            )}
            {breed.temperament && (
              <Chip size="small" label={`Temperament: ${breed.temperament}`} />
            )}
          </Stack>

          {breed.description && (
            <Typography variant="body1" sx={{ mt: 0.5 }}>
              {breed.description}
            </Typography>
          )}

          <Stack direction="row" spacing={2} mt={1}>
            <Button
              component={RouterLink}
              to={`/breeds/${breed.id}`}
              state={{ backgroundLocation }}
              variant="outlined"
              size="small"
            >
              View breed gallery
            </Button>
            {breed.wikipedia_url && (
              <Button
                component={Link}
                href={breed.wikipedia_url}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                Wikipedia
              </Button>
            )}
          </Stack>
        </Stack>
      ) : (
        <Typography variant="body1">
          No breed information available for this image.
        </Typography>
      )}
    </Container>
  );
}
