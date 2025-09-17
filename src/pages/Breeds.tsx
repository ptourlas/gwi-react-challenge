import { useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useSearchParams } from "react-router";
import {
  Alert,
  Box,
  Container,
  Divider,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useQuery } from "@tanstack/react-query";

type Breed = {
  id: string;
  name: string;
  origin?: string;
  temperament?: string;
};

const API_BASE = "https://api.thecatapi.com/v1";

async function fetchBreeds({ signal }: { signal?: AbortSignal }) {
  const headers: Record<string, string> = {};
  const apiKey = import.meta.env.VITE_CAT_API_KEY as string | undefined;
  if (apiKey) headers["x-api-key"] = apiKey;

  const res = await fetch(`${API_BASE}/breeds`, { headers, signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as Breed[];
  // sort A→Z to keep UX stable
  return data.sort((a, b) => a.name.localeCompare(b.name));
}

export default function Breeds() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") ?? "");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["breeds"],
    queryFn: ({ signal }) => fetchBreeds({ signal }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.origin?.toLowerCase().includes(q) ||
        b.temperament?.toLowerCase().includes(q)
    );
  }, [data, query]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <StickyTop>
        <Typography variant="h4" component="h1">
          Breeds
        </Typography>

        <TextField
          fullWidth
          size="small"
          value={query}
          sx={{ mt: 2, mb: 2 }}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by breed name, origin, temperament…"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        {error && <RetryFetchButton error={error} refetch={refetch} />}
      </StickyTop>

      {isLoading ? (
        <List disablePadding>
          {Array.from({ length: 10 }).map((_, i) => (
            <Box key={i}>
              <ListItem disableGutters>
                <Skeleton variant="rounded" width="100%" height={44} />
              </ListItem>
              <Divider />
            </Box>
          ))}
        </List>
      ) : (
        <List disablePadding>
          {filtered.map((breed, idx) => (
            <Box key={breed.id}>
              <ListItem disableGutters>
                <ListItemButton
                  component={Link}
                  to={`/breeds/${breed.id}`}
                  state={{ backgroundLocation: location }}
                >
                  <ListItemText
                    primary={breed.name}
                    secondary={
                      breed.origin ? `Origin: ${breed.origin}` : undefined
                    }
                  />
                </ListItemButton>
              </ListItem>
              {idx < filtered.length - 1 && <Divider component="li" />}
            </Box>
          ))}

          {!filtered.length && (
            <Box py={6} textAlign="center">
              <Typography variant="body1">
                No breeds match “{query}”.
              </Typography>
            </Box>
          )}
        </List>
      )}
    </Container>
  );
}

const RetryFetchButton = ({
  error,
  refetch,
}: {
  error: Error;
  refetch: () => void;
}) => (
  <Alert
    severity="error"
    sx={{ mb: 2, alignItems: "center" }}
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
    {(error as Error)?.message || "Failed to load breeds"}
  </Alert>
);

const StickyTop = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      py: 2,
      top: 1,
      borderBottom: 1,
      bgcolor: "white",
      position: "sticky",
      borderColor: "divider",
      zIndex: (t) => t.zIndex.appBar - 1,
    }}
  >
    {children}
  </Box>
);
