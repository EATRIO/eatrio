import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import HomePage from './pages/home-dashboard-cucina-adesso';
import RecipeDetailCookMode from './pages/recipe-detail-cook-mode';
import UserProfileProfilo from './pages/user-profile-profilo';
import CarrelloSpesa from './pages/shopping-list-spesa';
import RecipeCollectionRicette from './pages/recipe-collection-ricette';
import PantryManagementDispensa from './pages/pantry-management-dispensa';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home-dashboard-cucina-adesso" element={<HomePage />} />
          <Route path="/recipe-detail-cook-mode" element={<RecipeDetailCookMode />} />
          <Route path="/user-profile-profilo" element={<UserProfileProfilo />} />
          <Route path="/shopping-list-spesa" element={<CarrelloSpesa />} />
          <Route path="/recipe-collection-ricette" element={<RecipeCollectionRicette />} />
          <Route path="/pantry-management-dispensa" element={<PantryManagementDispensa />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;