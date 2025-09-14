// src/pages/Feed.tsx
import { useMemo } from "react";
import { Link, useLocation } from "react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
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

type Breed = { id: string; name: string };
type CatImage = { id: string; url: string; breeds?: Breed[] };

const API_BASE = "https://api.thecatapi.com/v1";
const PAGE_SIZE = 10;

async function fetchRandomImages({ signal }: { signal?: AbortSignal }) {
  const headers: Record<string, string> = {};
  const apiKey = import.meta.env.VITE_CAT_API_KEY as string | undefined;
  if (apiKey) headers["x-api-key"] = apiKey;

  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    size: "med",
    has_breeds: "1",
  });

  const res = await fetch(`${API_BASE}/images/search?${params}`, {
    headers,
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as CatImage[];
  return data;
}

export default function Feed() {
  const location = useLocation();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage, // with random results this is always "true" for UX
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["random-cats"],
    queryFn: ({ signal }) => fetchRandomImages({ signal }),
    initialPageParam: 0,
    getNextPageParam: (_ /*lastPage*/, _allPages, lastPageParam) =>
      // We can keep returning a number just to satisfy the API;
      // thecatapi returns random images each time.
      (lastPageParam ?? 0) + 1,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  const images: CatImage[] = useMemo(
    () => (data?.pages ?? []).flat(),
    [data?.pages]
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h4" component="h1">
          Random Cats
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
          {error && (
            <Button variant="outlined" color="error" onClick={() => refetch()}>
              Retry
            </Button>
          )}
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as Error)?.message || "Failed to load cats"}
        </Alert>
      )}

      {/* Grid of images (with first-load skeletons) */}
      {isLoading ? (
        <ImageList variant="masonry" cols={3} gap={8} sx={{ m: 0 }}>
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Box key={`skeleton-${i}`}>
              <Skeleton variant="rounded" height={240} />
            </Box>
          ))}
        </ImageList>
      ) : (
        <ImageList variant="masonry" cols={3} gap={8} sx={{ m: 0 }}>
          {images.map((img) => (
            <ImageListItem key={img.id}>
              <Box
                component={Link}
                to={`/images/${img.id}`}
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
                  alt="Cat"
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

      {/* Bottom controls */}
      <Stack alignItems="center" mt={3}>
        <Button
          variant="outlined"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage || isLoading || !hasNextPage}
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
    </Container>
  );
}
