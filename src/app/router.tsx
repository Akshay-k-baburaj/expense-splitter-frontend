import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import App from "../App";
import GroupListPage from "../features/groups/GroupListPage";
import GroupCreatePage from "../features/groups/GroupCreatePage";
import GroupDetailsPage from "../features/groups/GroupDetailsPage";
import GroupBalancesPage from "../features/groups/GroupBalancesPage";
import GroupSettingsPage from "../features/groups/GroupSettingsPage";
import AccountPage from "../features/users/AccountPage";
import HomePage from "../features/home/HomePage";

function GroupDetailsRoute() {
  const { groupId } = useParams();
  return <GroupDetailsPage key={groupId ?? "invalid"} />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/groups" element={<GroupListPage />} />
          <Route path="/groups/new" element={<GroupCreatePage />} />
          <Route path="/groups/:groupId/balances" element={<GroupBalancesPage />} />
          <Route path="/groups/:groupId/settings" element={<GroupSettingsPage />} />
          <Route path="/groups/:groupId" element={<GroupDetailsRoute />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="*" element={<Navigate to="/groups" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
