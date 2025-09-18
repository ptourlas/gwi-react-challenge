import { useState } from "react";
import {
  Link as RouterLink,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useFavourites } from "../store/useFavorites";
//@ts-expect-error NO TYPES AVAILABLE
import { countryCodeEmoji } from "country-code-emoji";

type Breed = {
  id: string;
  name: string;
  origin?: string;
  temperament?: string;
  description?: string;
  wikipedia_url?: string;
  country_code?: string;
};

type ImageById = {
  id: string;
  url: string;
  breeds?: Breed[];
};

const API_BASE = import.meta.env.VITE_API_BASE;

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
  const theme = useTheme();
  const { imageId = "" } = useParams();
  const isMediumWidth = useMediaQuery(theme.breakpoints.down("md"));

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

  const imageActionsProps = {
    data,
    fav,
    copied,
    copyLink,
    handleToggleFavourite,
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
    <Container maxWidth={false} sx={{ py: 2 }}>
      <Stack
        direction={isMediumWidth ? "column" : "row"}
        spacing={1}
        alignItems="center"
      >
        <Stack direction="column" spacing={1} alignItems="center">
          <Box
            component="img"
            src={data.url}
            alt={breed ? `${breed.name} cat` : "Cat"}
            loading="eager"
            sx={{
              width: "100%",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          />
          <ImageActions {...imageActionsProps} />
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {breed ? (
          <BreedInfoAndActions breed={breed} />
        ) : (
          <Typography variant="body1">
            No breed information available for this image.
          </Typography>
        )}
      </Stack>
    </Container>
  );
}

const ImageActions = ({
  fav,
  handleToggleFavourite,
  copied,
  copyLink,
  data,
}: {
  fav: boolean;
  copied: boolean;
  data: ImageById | undefined;
  handleToggleFavourite: () => void;
  copyLink: () => void;
}) => {
  const FavoritesButton = () => (
    <Tooltip title={fav ? "Remove from favourites" : "Add to favourites"}>
      <IconButton
        onClick={handleToggleFavourite}
        aria-label={fav ? "Remove from favourites" : "Add to favourites"}
        color={fav ? "error" : "default"}
      >
        {fav ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      </IconButton>
    </Tooltip>
  );

  const CopyButton = () => (
    <Tooltip title={copied ? "Copied!" : "Copy link"}>
      <span>
        <IconButton onClick={copyLink} aria-label="Copy link">
          <ContentCopyIcon />
        </IconButton>
      </span>
    </Tooltip>
  );

  const OpenOriginalButton = () => (
    <Tooltip title="Open original">
      <IconButton
        component={Link}
        href={data?.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open original image"
      >
        <OpenInNewIcon />
      </IconButton>
    </Tooltip>
  );

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        <FavoritesButton />
        <CopyButton />
        <OpenOriginalButton />
      </Stack>
    </>
  );
};

const BreedInfoAndActions = ({ breed }: { breed: Breed }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Preserve the original background when nesting modals
  const backgroundLocation =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (location.state as any)?.backgroundLocation || location;

  const getFlag = () =>
    breed.country_code ? countryCodeEmoji(breed.country_code) : "";

  const navigateToBreedOrigin = () =>
    breed.origin ? navigate(`/breeds?search=${breed.origin}`) : null;

  return (
    <Stack spacing={1.5}>
      <Typography variant="h6" component="h2">
        {breed.name}
      </Typography>

      <Stack direction="column" spacing={1} flexWrap="wrap">
        {breed.origin && (
          <div onClick={navigateToBreedOrigin}>
            <Chip
              clickable
              size="small"
              label={`Origin: ${getFlag()} ${breed.origin}`}
            />
          </div>
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
  );
};
