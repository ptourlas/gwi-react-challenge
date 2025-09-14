import { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  ImageList,
  ImageListItem,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

type Breed = { id: string; name: string };
type CatImage = {
  id: string;
  url: string;
  breeds?: Breed[];
};

const API_BASE = "https://api.thecatapi.com/v1";
const PAGE_SIZE = 12;

async function fetchBreedImages({
  breedId,
  signal,
}: {
  breedId: string;
  signal?: AbortSignal;
}) {
  const headers: Record<string, string> = {};
  const apiKey = import.meta.env.VITE_CAT_API_KEY as string | undefined;
  if (apiKey) headers["x-api-key"] = apiKey;

  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    breed_ids: breedId,
    size: "med",
  });

  const res = await fetch(`${API_BASE}/images/search?${params}`, {
    headers,
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as CatImage[];
  return data;
}

export default function BreedGallery() {
  const { breedId = "" } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Infinite pages of images for the selected breed
  const { data, isLoading, isFetchingNextPage, fetchNextPage, error, refetch } =
    useInfiniteQuery({
      queryKey: ["breed-images", breedId],
      queryFn: ({ signal }) => fetchBreedImages({ breedId, signal }),
      enabled: !!breedId,
      initialPageParam: 0,
      getNextPageParam: (_last, _all, lastParam) => (lastParam ?? 0) + 1,
      refetchOnWindowFocus: false,
    });

  const images: CatImage[] = useMemo(
    () => (data?.pages ?? []).flat(),
    [data?.pages]
  );

  // Try to resolve a friendly name:
  // 1) from the cached breeds list if available
  // 2) from the first image's embedded breed info
  const cachedBreeds = queryClient.getQueryData<Breed[]>(["breeds"]);
  const nameFromCache = cachedBreeds?.find((b) => b.id === breedId)?.name;
  const nameFromImages = images.find((img) => img.breeds?.length)?.breeds?.[0]
    .name;
  const breedName = nameFromCache || nameFromImages || breedId;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h4" component="h1">
          {breedName}
        </Typography>
        <Button
          variant="outlined"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage || isLoading}
        >
          {isFetchingNextPage ? "Loading…" : "Load more"}
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Box
              component="button"
              onClick={() => refetch()}
              style={{
                all: "unset",
                cursor: "pointer",
                color: "inherit",
                fontWeight: 600,
              }}
            >
              Retry
            </Box>
          }
        >
          {(error as Error)?.message || "Failed to load images"}
        </Alert>
      )}

      {isLoading ? (
        <ImageList variant="masonry" cols={3} gap={8} sx={{ m: 0 }}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Box key={`skeleton-${i}`}>
              <Skeleton variant="rounded" height={220} />
            </Box>
          ))}
        </ImageList>
      ) : (
        <>
          {!images.length ? (
            <Box py={6} textAlign="center">
              <Typography>No images found for this breed.</Typography>
            </Box>
          ) : (
            <ImageList variant="masonry" cols={3} gap={8} sx={{ m: 0 }}>
              {images.map((img) => (
                <ImageListItem key={img.id}>
                  <Box
                    component={Link}
                    to={`/breeds/${breedId}/images/${img.id}`}
                    state={{ backgroundLocation: location }}
                    sx={{
                      display: "block",
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover img": { transform: "scale(1.02)" },
                    }}
                  >
                    <Box
                      component="img"
                      src={img.url}
                      alt={`${breedName} cat`}
                      loading="lazy"
                      sx={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        transition: "transform 200ms ease",
                      }}
                    />
                  </Box>
                </ImageListItem>
              ))}
            </ImageList>
          )}

          <Stack alignItems="center" mt={3}>
            <Button
              variant="outlined"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage || isLoading}
            >
              {isFetchingNextPage ? (
                <Stack direction="row" gap={1} alignItems="center">
                  <CircularProgress size={18} />
                  <span>Loading…</span>
                </Stack>
              ) : (
                "Load more"
              )}
            </Button>
          </Stack>
        </>
      )}
    </Container>
  );
}
