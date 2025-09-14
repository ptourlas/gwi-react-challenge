import { Routes, Route, useLocation } from "react-router";
import RootLayout from "./layouts/RootLayout";
import Feed from "./pages/Feed";
import Breeds from "./pages/Breeds";
import Favourites from "./pages/Favorites";
import ImageDetail from "./pages/ImageDetail";
import BreedGallery from "./pages/BreedGallery";
import Modal from "./components/Modal";

export default function App() {
  const location = useLocation();
  const state = location.state as { backgroundLocation?: Location };

  return (
    <>
      {/* 1) Main routes — render with background if present */}
      <Routes location={state?.backgroundLocation || location}>
        <Route element={<RootLayout />}>
          <Route index element={<Feed />} />
          <Route path="breeds" element={<Breeds />} />
          <Route path="favourites" element={<Favourites />} />

          {/* Standalone (non-modal) detail pages */}
          <Route path="images/:imageId" element={<ImageDetail />} />
          <Route path="breeds/:breedId" element={<BreedGallery />} />
          <Route
            path="breeds/:breedId/images/:imageId"
            element={<ImageDetail />}
          />
        </Route>
      </Routes>

      {/* 2) Modal layer — only renders when we have a background */}
      {state?.backgroundLocation && (
        <Routes>
          <Route
            path="images/:imageId"
            element={
              <Modal title="Image detail">
                <ImageDetail />
              </Modal>
            }
          />
          <Route
            path="breeds/:breedId"
            element={
              <Modal title="Breed gallery">
                <BreedGallery />
              </Modal>
            }
          />
          <Route
            path="breeds/:breedId/images/:imageId"
            element={
              <Modal title="Image detail">
                <ImageDetail />
              </Modal>
            }
          />
        </Routes>
      )}
    </>
  );
}
