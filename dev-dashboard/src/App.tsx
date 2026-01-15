import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import CommitGenerator from "@/pages/CommitGenerator"
import JsonConverter from "@/pages/JsonConverter"
import RegexExplainer from "@/pages/RegexExplainer"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/commit-generator" replace />} />
          <Route path="commit-generator" element={<CommitGenerator />} />
          <Route path="json-converter" element={<JsonConverter />} />
          <Route path="regex-explainer" element={<RegexExplainer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
