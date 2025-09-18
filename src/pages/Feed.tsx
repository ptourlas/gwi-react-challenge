import { useMemo } from "react";
import { Link, useLocation } from "react-router";
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { uniqueById } from "../utils/uniqueById";

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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

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
  const theme = useTheme();
  const location = useLocation();
  const isMediumWidth = useMediaQuery(theme.breakpoints.down("md"));
  const columnNumber = useMemo(() => (isMediumWidth ? 2 : 3), [isMediumWidth]);

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
    refetchOnWindowFocus: false,
  });

  const qc = useQueryClient();

  const images = useMemo(
    () => uniqueById((data?.pages ?? []).flat()),
    [data?.pages]
  );

  async function loadMoreUniques(minNew = 6, maxTries = 3) {
    let tries = 0;
    const before = new Set(images.map((i) => i.id));

    while (tries < maxTries) {
      await fetchNextPage();

      const latest = (
        qc.getQueryData<InfiniteData<CatImage, unknown>>(["random-cats"])
          ?.pages ?? []
      ).flat();

      const after = new Set(latest.map((i: CatImage) => i.id));
      const newCount = [...after].filter((id) => !before.has(id)).length;

      if (newCount >= minNew) break;
      tries++;
    }
  }

  const { setRef } = useInfiniteScroll({
    onLoadMore: () => loadMoreUniques(),
    disabled: isFetchingNextPage || isLoading,
    hasMore: hasNextPage ?? true,
    root: null,
    rootMargin: "1px",
    threshold: 0,
  });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h4" component="h1">
          Gallery
        </Typography>

        {error ? (
          <Button variant="outlined" color="error" onClick={() => refetch()}>
            Retry
          </Button>
        ) : (
          <Button
            variant="outlined"
            onClick={() => refetch()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading…" : "Refresh"}
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as Error)?.message || "Failed to load cats"}
        </Alert>
      )}

      <ImageList variant="masonry" cols={columnNumber} gap={8}>
        {isLoading
          ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <Box key={`skeleton-${i}`}>
                <Skeleton variant="rounded" height={240} />
              </Box>
            ))
          : images.map((img) => (
              <ImageListItem key={img.id}>
                <Box
                  component={Link}
                  to={`/images/${img.id}`}
                  state={{ backgroundLocation: location }}
                >
                  <Box
                    component="img"
                    src={img.url}
                    alt="Cat"
                    loading="lazy"
                    sx={{
                      borderRadius: 2,
                      width: "100%",
                    }}
                  />
                </Box>
              </ImageListItem>
            ))}
      </ImageList>

      {/* Infinite-scroll sentinel */}
      <Box ref={setRef} aria-hidden sx={{ height: 1, mt: 2 }} />

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
